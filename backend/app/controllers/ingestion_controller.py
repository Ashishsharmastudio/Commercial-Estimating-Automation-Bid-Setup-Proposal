from datetime import datetime, timezone
from typing import Dict, Any, Optional
from rapidfuzz import fuzz
from app.models.project import (
    Project,
    ProjectStage,
    AIRecommendation,
    WorkScopeType,
    WinProbabilityTier,
    GCInvite,
    CSICitation,
    SpecifiedManufacturer,
    ProjectDocument,
    ActivityLog,
)
from app.models.company_settings import CompanySettings
from app.models.ai_feedback import AIFeedbackRule
from app.models.user import User

class IngestionController:
    @staticmethod
    async def ingest_bid_invite(payload: Dict[str, Any], current_user: User) -> Project:
        config = await CompanySettings.find_one()
        if not config:
            config = CompanySettings()
            await config.insert()

        incoming_name = payload.get("project_name", "").strip()
        incoming_address = payload.get("project_address", "").strip()
        gc_name = payload.get("gc_company_name", "General Contractor")
        source_platform = payload.get("source_platform", "Direct Email")

        # 1. MULTI-GC DEDUPLICATION VIA RAPIDFUZZ
        all_projects = await Project.find_all().to_list()
        matched_project: Optional[Project] = None
        for existing in all_projects:
            name_score = fuzz.token_sort_ratio(incoming_name.lower(), existing.project_name.lower())
            addr_score = fuzz.partial_ratio(incoming_address.lower(), existing.project_address.lower())
            if name_score >= 82 or (name_score >= 70 and addr_score >= 85):
                matched_project = existing
                break

        new_gc_invite = GCInvite(
            gc_company_name=gc_name,
            gc_contact_name=payload.get("gc_contact_name"),
            gc_contact_email=payload.get("gc_contact_email"),
            source_platform=source_platform,
            portal_project_url=payload.get("portal_project_url"),
            gc_specific_due_date=payload.get("bid_due_date"),
        )

        # Check VIP Pre-Screened GC Whitelist
        is_vip_gc = any(
            fuzz.partial_ratio(gc_name.lower(), vip.lower()) >= 85
            for vip in config.vip_prescreened_gcs
        )

        if matched_project:
            # Merge GC invite into existing project dossier instead of duplicating
            already_listed = any(
                inv.gc_company_name.lower() == gc_name.lower() for inv in matched_project.gc_invites
            )
            if not already_listed:
                matched_project.gc_invites.append(new_gc_invite)
            if source_platform not in matched_project.platform_tags:
                matched_project.platform_tags.append(source_platform)
            if is_vip_gc:
                matched_project.is_prescreened_gc_invite = True

            matched_project.activity_logs.insert(
                0,
                ActivityLog(
                    actor_name=current_user.full_name,
                    actor_role=current_user.role.value,
                    action_type="MULTI_GC_MERGED",
                    comment_text=(
                        f"Deduplication Engine merged additional bid invite from GC '{gc_name}' "
                        f"via {source_platform}. Total inviting GCs: {len(matched_project.gc_invites)}."
                    ),
                ),
            )
            matched_project.updated_at = datetime.now(timezone.utc)
            await matched_project.save()
            return matched_project

        # 2. CREATE NEW PROJECT & RUN DETERMINISTIC + AI QUALIFICATION
        project = Project(
            project_name=incoming_name,
            project_address=incoming_address,
            city=payload.get("city", ""),
            state=payload.get("state", "PA"),
            zip_code=payload.get("zip_code", ""),
            distance_miles=float(payload.get("distance_miles", 25.0)),
            drive_time_hours=float(payload.get("drive_time_hours", 0.8)),
            bid_due_date=payload.get("bid_due_date", "2026-12-18"),
            estimated_project_slot=payload.get("estimated_project_slot", "Summer 2027"),
            estimated_sq_ft=float(payload.get("estimated_sq_ft", 0.0)),
            architect_firm_name=payload.get("architect_firm_name", "Kimmel Bogrette Architecture"),
            platform_tags=[source_platform],
            is_prescreened_gc_invite=is_vip_gc,
            gc_invites=[new_gc_invite],
            sales_tax_status=payload.get("sales_tax_status", "Tax Exempt"),
            bid_type=payload.get("bid_type", "Sealed Bid"),
            labor_type=payload.get("labor_type", "Prevailing Wage"),
        )

        # Parse simulated or extracted CSI codes & manufacturers
        raw_codes = payload.get("detected_csi_codes", [])
        for c in raw_codes:
            project.detected_csi_codes.append(CSICitation(**c))

        raw_mfrs = payload.get("specified_manufacturers", [])
        for m in raw_mfrs:
            project.specified_manufacturers.append(SpecifiedManufacturer(**m))

        await IngestionController.evaluate_project_qualification(project, config)

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name="AI Ingestion & Spec Agent",
                actor_role="AI_WORKER",
                action_type="INGESTED_AND_EVALUATED",
                comment_text=(
                    f"Ingested from {source_platform} (GC: {gc_name}). "
                    f"AI Recommendation: {project.ai_recommendation.value} ({int(project.ai_confidence_score * 100)}%)."
                ),
            ),
        )
        await project.insert()
        return project

    @staticmethod
    async def evaluate_project_qualification(project: Project, config: CompanySettings) -> None:
        feedback_rules = await AIFeedbackRule.find(AIFeedbackRule.is_active == True).to_list()
        codes_str = [c.code for c in project.detected_csi_codes]

        has_wood = any(c in config.target_csi_codes for c in codes_str)
        has_resilient = any(c in config.excluded_csi_codes for c in codes_str)

        project.has_target_wood_code = has_wood
        project.has_resilient_code_only = has_resilient and not has_wood
        risk_flags = []

        # Check Footprint vs Drive-Time Heuristic (Karla & Megan's 200 sq ft / 4 hr drive rule)
        too_small_for_distance = (
            project.estimated_sq_ft > 0
            and project.estimated_sq_ft < config.min_sq_ft_for_long_distance
            and (
                project.drive_time_hours >= config.max_drive_time_hours
                or project.distance_miles > config.max_service_radius_miles
            )
        )
        if too_small_for_distance:
            risk_flags.append(
                f"Small footprint ({int(project.estimated_sq_ft)} sq ft) vs. long travel "
                f"({project.drive_time_hours} hrs / {int(project.distance_miles)} mi). Shipping & travel exceed margin."
            )

        if project.has_resilient_code_only:
            risk_flags.append(
                "Spec contains 09 65 66 (Resilient Synthetic Athletic Flooring) with NO 09 64 00 / 09 64 66 Wood Flooring."
            )

        # Apply decision logic
        if project.has_resilient_code_only:
            project.ai_recommendation = AIRecommendation.RECOMMEND_REJECT
            project.ai_confidence_score = 0.97
            project.work_type = WorkScopeType.RESILIENT_SYNTHETIC_ONLY
            project.ai_reasoning_summary = (
                "REJECT RECOMMENDED: Specification Division 09 calls exclusively for Section 09 65 66 "
                "(Resilient Athletic Flooring / synthetic membrane). No hardwood or maple gymnasium flooring "
                "(09 64 00 / 09 64 66) is present in the base bid. System will monitor future Addenda automatically."
            )
        elif too_small_for_distance:
            project.ai_recommendation = AIRecommendation.RECOMMEND_REJECT
            project.ai_confidence_score = 0.94
            project.ai_reasoning_summary = (
                f"REJECT RECOMMENDED: While wood flooring scope exists, total area is only {int(project.estimated_sq_ft)} sq ft "
                f"and the job site is {project.drive_time_hours} hours away ({int(project.distance_miles)} miles). "
                "Fails Atlantic's minimum footprint-to-distance threshold."
            )
        elif has_wood:
            project.ai_recommendation = AIRecommendation.RECOMMEND_BID
            project.ai_confidence_score = 0.95
            if project.work_type == WorkScopeType.UNKNOWN_OR_NONE:
                project.work_type = WorkScopeType.NEW_INSTALLATION
            mfr_names = ", ".join([m.manufacturer_name for m in project.specified_manufacturers]) or "Standard Maple Mills"
            rule_note = f" Checked against {len(feedback_rules)} active Karla feedback rules." if feedback_rules else ""
            project.ai_reasoning_summary = (
                f"BID RECOMMENDED: Confirmed target wood flooring code {', '.join(codes_str)} "
                f"covering ~{int(project.estimated_sq_ft):,} sq ft ({project.drive_time_hours} hr drive). "
                f"Architect: {project.architect_firm_name}. Approved Manufacturers: {mfr_names}.{rule_note}"
            )
        else:
            project.ai_recommendation = AIRecommendation.NEEDS_MANUAL_REVIEW
            project.ai_confidence_score = 0.60
            project.ai_reasoning_summary = (
                "MANUAL REVIEW NEEDED: No explicit CSI 09 64 00 or 09 64 66 code indexed in spec TOC; "
                "verify Architectural Finish Schedule on sheets A103/A106."
            )

        project.ai_risk_flags = risk_flags

    @staticmethod
    async def process_addendum_upload(
        project_id: str, addendum_payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        Handles Karla's Addendum Rule:
        If a project was previously rejected (e.g., 09 65 66 Resilient Only), and Addendum #2/#3 swaps
        or adds 09 64 66 Wood Flooring, automatically flag `has_unread_addendum = True` and move back to Triage!
        """
        project = await Project.get(project_id)
        if not project:
            raise ValueError("Project not found")

        addendum_num = int(addendum_payload.get("addendum_number", 1))
        introduces_wood = bool(addendum_payload.get("introduces_wood_code_096466", False))
        summary_text = addendum_payload.get(
            "summary",
            f"Addendum #{addendum_num} adds Section 09 64 66 Maple Gymnasium Wood Flooring (replacing synthetic resilient floor).",
        )

        new_doc = ProjectDocument(
            doc_category="ADDENDUM",
            addendum_number=addendum_num,
            file_name=addendum_payload.get("file_name", f"Addendum_0{addendum_num}.pdf"),
            storage_url=addendum_payload.get("storage_url", f"/docs/addendum_{addendum_num}.pdf"),
            relevant_sheets=addendum_payload.get("relevant_sheets", ["A106", "Spec 09 64 66"]),
            uploaded_by=current_user.full_name,
        )
        project.documents.append(new_doc)
        project.has_unread_addendum = True
        project.latest_addendum_summary = summary_text

        if introduces_wood:
            project.detected_csi_codes.append(
                CSICitation(
                    code="09 64 66",
                    title=f"Wood Athletic Flooring (Added in Addendum #{addendum_num})",
                    document_name=new_doc.file_name,
                    page_number=4,
                    snippet=summary_text,
                    is_target_wood=True,
                )
            )
            project.has_target_wood_code = True
            project.has_resilient_code_only = False
            project.work_type = WorkScopeType.NEW_INSTALLATION
            if project.estimated_sq_ft == 0:
                project.estimated_sq_ft = float(addendum_payload.get("estimated_sq_ft", 8500.0))

            # If previously rejected, resurrect back into Karla's Triage Queue!
            if project.stage == ProjectStage.NO_BID_REJECTED:
                project.stage = ProjectStage.NEW_BID_INVITE
                project.karla_decision = None

            config = await CompanySettings.find_one() or CompanySettings()
            await IngestionController.evaluate_project_qualification(project, config)
            project.ai_reasoning_summary = (
                f"ADDENDUM #{addendum_num} RE-QUALIFICATION ALERT: Previously rejected project now includes "
                f"Section 09 64 66 Wood Athletic Flooring! {summary_text}"
            )

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="ADDENDUM_DETECTED",
                comment_text=f"Addendum #{addendum_num} uploaded & scanned: {summary_text}",
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project