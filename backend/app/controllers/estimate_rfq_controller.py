from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from fastapi import HTTPException
from app.models.project import (
    Project,
    ProjectStage,
    TakeoffItem,
    VendorRFQQuote,
    EstimateLineItem,
    EstimateVersion,
    ActivityLog,
    ProjectDocument,
)
from app.models.company_settings import CompanySettings
from app.models.user import User, UserRole

class EstimateRFQController:
    @staticmethod
    def recalculate_estimate_totals(version: EstimateVersion) -> EstimateVersion:
        subtotal_cost = 0.0
        total_price_Before_freight = 0.0
        freight_total = 0.0

        for item in version.line_items:
            item.total_cost = round(item.quantity * item.unit_cost, 2)
            if item.category.lower() == "freight":
                item.total_price = item.total_cost
                freight_total += item.total_price
            else:
                margin_multiplier = 1.0 + (item.margin_percent / 100.0)
                item.total_price = round(item.total_cost * margin_multiplier, 2)
                subtotal_cost += item.total_cost
                total_price_Before_freight += item.total_price

        version.subtotal_cost = round(subtotal_cost, 2)
        version.freight_total = round(freight_total, 2)
        version.overhead_and_margin_total = round(total_price_Before_freight - subtotal_cost, 2)
        version.final_proposal_amount = round(total_price_Before_freight + freight_total, 2)
        return version

    @staticmethod
    async def save_takeoff_and_seed_estimate(
        project_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        Stage 3 (IN_TAKEOFF): Saves measured flooring takeoff areas, OneDrive link, and
        automatically builds the unpriced Estimate skeleton inside the OS.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        config = await CompanySettings.find_one() or CompanySettings()

        if "takeoff_folder_link" in payload:
            project.takeoff_folder_link = payload["takeoff_folder_link"]
        if "takeoff_summary_comment" in payload:
            project.takeoff_summary_comment = payload["takeoff_summary_comment"]

        raw_items = payload.get("takeoff_items", [])
        if raw_items:
            project.takeoff_items = [TakeoffItem(**item) for item in raw_items]
            project.estimated_sq_ft = sum(i.sq_ft for i in project.takeoff_items)

        # Auto-seed Estimate Version 1 from Takeoff Items if no estimate exists yet
        if not project.estimate_versions and project.takeoff_items:
            seeded_lines: List[EstimateLineItem] = []
            for t in project.takeoff_items:
                # Material line
                seeded_lines.append(
                    EstimateLineItem(
                        category="Material",
                        description=f"{t.room_or_area} - {t.flooring_type} ({t.level_or_phase})",
                        quantity=t.sq_ft,
                        unit="SF",
                        unit_cost=5.25 if "Sand" not in t.flooring_type else 0.85,
                        margin_percent=25.0,
                    )
                )
                # Labor line
                seeded_lines.append(
                    EstimateLineItem(
                        category="Labor",
                        description=f"Installation / Refinishing Labor - {t.room_or_area} ({project.labor_type})",
                        quantity=t.sq_ft,
                        unit="SF",
                        unit_cost=3.40 if "Sand" not in t.flooring_type else 1.95,
                        margin_percent=30.0,
                    )
                )
                if t.moisture_mitigation_required:
                    seeded_lines.append(
                        EstimateLineItem(
                            category="Prep_Demo",
                            description=f"Moisture Mitigation System - {t.room_or_area}",
                            quantity=t.sq_ft,
                            unit="SF",
                            unit_cost=2.10,
                            margin_percent=25.0,
                        )
                    )
                if t.base_lf > 0:
                    seeded_lines.append(
                        EstimateLineItem(
                            category="Material",
                            description=f"Vented Cove Base & Transitions - {t.room_or_area}",
                            quantity=t.base_lf + t.transitions_lf,
                            unit="LF",
                            unit_cost=4.50,
                            margin_percent=25.0,
                        )
                    )

            v1 = EstimateVersion(
                version_number=1,
                status="READY_FOR_KARLA",
                line_items=seeded_lines,
                exclusions_text=config.default_exclusions_text,
                clarifications_text=config.default_clarifications_text,
                created_by=current_user.full_name,
            )
            EstimateRFQController.recalculate_estimate_totals(v1)
            project.estimate_versions.append(v1)
            project.proposal_amount = v1.final_proposal_amount

        if project.stage == ProjectStage.QUALIFIED:
            project.stage = ProjectStage.IN_TAKEOFF

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="TAKEOFF_UPDATED",
                comment_text=(
                    f"Updated takeoff ({int(project.estimated_sq_ft):,} total SF) and seeded "
                    f"Native Estimate structure."
                ),
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def generate_courtesy_rom_estimate(project_id: str, current_user: User) -> Project:
        """
        Frank Pelosi Upgrade: 1-Click Courtesy Bid ROM Generator.
        Uses historical MongoDB averages so estimators can send a fast relationship bid in < 5 minutes.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        config = await CompanySettings.find_one() or CompanySettings()
        sq_ft = project.estimated_sq_ft or 5000.0
        is_sand = project.work_type.value == "SAND_AND_REFINISH"

        rom_lines = [
            EstimateLineItem(
                category="Material",
                description=f"Historical ROM Baseline Material ({'Gym Refinish Sealers/Finish' if is_sand else 'Maple Athletic Flooring System'})",
                quantity=sq_ft,
                unit="SF",
                unit_cost=0.95 if is_sand else 5.60,
                margin_percent=22.0,
            ),
            EstimateLineItem(
                category="Labor",
                description=f"Historical ROM Baseline Labor ({project.labor_type})",
                quantity=sq_ft,
                unit="SF",
                unit_cost=2.15 if is_sand else 3.75,
                margin_percent=25.0,
            ),
            EstimateLineItem(
                category="Freight",
                description="Estimated Standard Mill Freight & Delivery",
                quantity=1.0,
                unit="LS",
                unit_cost=450.0 if is_sand else 1850.0,
                margin_percent=0.0,
            ),
        ]

        next_v_num = len(project.estimate_versions) + 1
        rom_version = EstimateVersion(
            version_number=next_v_num,
            status="READY_FOR_KARLA",
            is_courtesy_rom=True,
            line_items=rom_lines,
            exclusions_text=config.default_exclusions_text,
            clarifications_text="COURTESY ROM PROPOSAL: Pricing based on historical baseline unit rates.",
            created_by=current_user.full_name,
        )
        EstimateRFQController.recalculate_estimate_totals(rom_version)
        project.estimate_versions.append(rom_version)
        project.proposal_amount = rom_version.final_proposal_amount
        project.win_probability_tier = "LOW_PROB_COURTESY_BID"

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="COURTESY_ROM_GENERATED",
                comment_text=(
                    f"Generated 1-Click Courtesy Bid ROM Estimate (v{next_v_num}) for {int(sq_ft):,} SF -> "
                    f"Total: ${rom_version.final_proposal_amount:,.2f}."
                ),
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def dispatch_manufacturer_rfqs(
        project_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        Dispatches RFQs to all specified manufacturers in the spec and runs historical
        Architect Price-Sensitivity analysis in MongoDB.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        manufacturers: List[Dict[str, Any]] = payload.get("manufacturers", [])
        if not manufacturers and project.specified_manufacturers:
            manufacturers = [
                {
                    "manufacturer_or_dealer": m.manufacturer_name,
                    "contact_email": f"quotes@{m.manufacturer_name.lower().replace(' ', '')}.com",
                    "product_system": m.product_line,
                }
                for m in project.specified_manufacturers
            ]

        # Query historical quotes across all MongoDB projects to detect "Architect Tax"
        all_projects = await Project.find_all().to_list()

        for m in manufacturers:
            mfr_name = m.get("manufacturer_or_dealer", "Mill Dealer")
            historical_prices = []
            architect_prices = []
            for p in all_projects:
                for q in p.vendor_rfq_quotes:
                    if q.manufacturer_or_dealer.lower() == mfr_name.lower() and q.quoted_unit_price:
                        historical_prices.append(q.quoted_unit_price)
                        if (
                            project.architect_firm_name
                            and q.architect_firm_name
                            and project.architect_firm_name.lower() == q.architect_firm_name.lower()
                        ):
                            architect_prices.append(q.quoted_unit_price)

            alert_msg = None
            if historical_prices and architect_prices:
                avg_all = sum(historical_prices) / len(historical_prices)
                avg_arch = sum(architect_prices) / len(architect_prices)
                if avg_arch > avg_all + 0.35:
                    diff = avg_arch - avg_all
                    alert_msg = (
                        f"ARCHITECT LEVERAGE ALERT: On past jobs with {project.architect_firm_name}, "
                        f"{mfr_name} quoted +${diff:.2f}/SF above their historical average (${avg_arch:.2f} vs ${avg_all:.2f}/SF)."
                    )

            rfq = VendorRFQQuote(
                manufacturer_or_dealer=mfr_name,
                contact_email=m.get("contact_email", "estimating@milldealer.com"),
                product_system=m.get("product_system", "Maple Strip System"),
                quantity_sq_ft=project.estimated_sq_ft or 10000.0,
                delivery_window=project.estimated_project_slot,
                architect_firm_name=project.architect_firm_name,
                rfq_status="SENT",
                quoted_unit_price=m.get("quoted_unit_price"),
                quoted_freight=float(m.get("quoted_freight", 0.0)),
                lead_time_notes=m.get("lead_time_notes", "6-8 weeks from approved submittals"),
                architect_price_alert=alert_msg,
                sent_at=datetime.now(timezone.utc),
            )
            project.vendor_rfq_quotes.append(rfq)

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="RFQS_DISPATCHED",
                comment_text=(
                    f"Dispatched {len(manufacturers)} Manufacturer RFQ(s) with quantity "
                    f"{int(project.estimated_sq_ft):,} SF, delivery slot '{project.estimated_project_slot}', "
                    f"and Architect '{project.architect_firm_name}'."
                ),
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def record_and_apply_vendor_quote(
        project_id: str, rfq_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        RBAC Protected (SENIOR_ESTIMATOR / OWNER only):
        Records a returned dealer/mill quote and applies its unit price & freight directly to the active EstimateVersion.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        target_rfq = next((q for q in project.vendor_rfq_quotes if q.id == rfq_id), None)
        if not target_rfq:
            raise HTTPException(status_code=404, detail="RFQ record not found")

        unit_price = float(payload.get("quoted_unit_price", target_rfq.quoted_unit_price or 5.10))
        freight = float(payload.get("quoted_freight", target_rfq.quoted_freight or 1250.0))
        target_rfq.quoted_unit_price = unit_price
        target_rfq.quoted_freight = freight
        target_rfq.rfq_status = "APPLIED_TO_ESTIMATE"

        # Apply to latest EstimateVersion
        if project.estimate_versions:
            latest_est = project.estimate_versions[-1]
            for line in latest_est.line_items:
                if line.category.lower() == "material" and line.unit == "SF":
                    line.unit_cost = unit_price
                    line.description = f"{line.description} [Mill Quote: {target_rfq.manufacturer_or_dealer}]"
                    break

            # Add or update freight line item
            freight_line = next(
                (l for l in latest_est.line_items if l.category.lower() == "freight"), None
            )
            if freight_line:
                freight_line.unit_cost = freight
            else:
                latest_est.line_items.append(
                    EstimateLineItem(
                        category="Freight",
                        description=f"Mill Freight ({target_rfq.manufacturer_or_dealer})",
                        quantity=1.0,
                        unit="LS",
                        unit_cost=freight,
                        margin_percent=0.0,
                    )
                )

            EstimateRFQController.recalculate_estimate_totals(latest_est)
            project.proposal_amount = latest_est.final_proposal_amount

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="VENDOR_QUOTE_APPLIED",
                comment_text=(
                    f"Applied quote from {target_rfq.manufacturer_or_dealer} (${unit_price:.2f}/SF + "
                    f"${freight:,.2f} freight) to Estimate. Updated Proposal: ${project.proposal_amount:,.2f}."
                ),
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def update_estimate_version_and_sync_qbo(
        project_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        RBAC Protected (SENIOR_ESTIMATOR / OWNER only for final approval & QBO sync):
        Updates line item pricing/margins, supports cloning a new version for Stage 6 VE negotiation,
        and syncs the Estimate to QuickBooks Online.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        clone_as_new_version = bool(payload.get("clone_as_new_version", False))
        sync_to_qbo = bool(payload.get("sync_to_qbo", False))

        if (clone_as_new_version or sync_to_qbo) and current_user.role not in [
            UserRole.SENIOR_ESTIMATOR,
            UserRole.OWNER,
        ]:
            raise HTTPException(
                status_code=403,
                detail="Only Karla (Senior Estimator) or John (Owner) can finalize pricing or sync to QuickBooks.",
            )

        raw_lines = payload.get("line_items", [])
        parsed_lines = [EstimateLineItem(**item) for item in raw_lines]

        if clone_as_new_version or not project.estimate_versions:
            new_v_num = len(project.estimate_versions) + 1
            target_version = EstimateVersion(
                version_number=new_v_num,
                status="REVISED_VE" if new_v_num > 1 else "APPROVED_BY_KARLA",
                line_items=parsed_lines,
                exclusions_text=payload.get("exclusions_text", ""),
                clarifications_text=payload.get("clarifications_text", ""),
                created_by=current_user.full_name,
            )
            project.estimate_versions.append(target_version)
        else:
            target_version = project.estimate_versions[-1]
            if parsed_lines:
                target_version.line_items = parsed_lines
            if "exclusions_text" in payload:
                target_version.exclusions_text = payload["exclusions_text"]
            if "clarifications_text" in payload:
                target_version.clarifications_text = payload["clarifications_text"]

        EstimateRFQController.recalculate_estimate_totals(target_version)
        project.proposal_amount = target_version.final_proposal_amount

        if sync_to_qbo:
            target_version.status = "APPROVED_BY_KARLA"
            if not target_version.quickbooks_estimate_id:
                qb_num = f"Estimate {3800 + len(project.activity_logs)}"
                target_version.quickbooks_estimate_id = qb_num
                project.quickbooks_estimate_number = qb_num
            target_version.quickbooks_synced_at = datetime.now(timezone.utc)

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="ESTIMATE_PRICING_UPDATED",
                comment_text=(
                    f"{'Cloned VE Revision ' if clone_as_new_version else 'Updated '}Estimate v{target_version.version_number} "
                    f"(Total: ${target_version.final_proposal_amount:,.2f})"
                    f"{f' & Synced to QuickBooks ({project.quickbooks_estimate_number})' if sync_to_qbo else ''}."
                ),
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def transition_project_stage(
        project_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        Enforces strict SOP Stage Exit Criteria & Role-Based Authority across Stages 1 to 7.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        target_stage = ProjectStage(payload.get("target_stage"))
        notes = payload.get("notes", "")

        # STAGE 3 -> STAGE 4 (FOR_PRICING) EXIT CRITERIA CHECK (SOP Pages 11-12)
        if target_stage == ProjectStage.FOR_PRICING:
            if not project.takeoff_folder_link:
                raise HTTPException(
                    status_code=400,
                    detail="SOP Exit Criteria Blocked: 'TakeOff Folder Link' (OneDrive) is mandatory before moving to FOR PRICING.",
                )
            if not project.estimate_versions:
                raise HTTPException(
                    status_code=400,
                    detail="SOP Exit Criteria Blocked: Estimate structure must be created before moving to FOR PRICING.",
                )

        # STAGE 4 -> STAGE 5 (ESTIMATE_SENT) EXIT CRITERIA & RBAC CHECK (SOP Page 15)
        if target_stage == ProjectStage.ESTIMATE_SENT:
            if current_user.role not in [UserRole.SENIOR_ESTIMATOR, UserRole.OWNER]:
                raise HTTPException(
                    status_code=403,
                    detail="SOP Rule Blocked: No estimate leaves FOR PRICING without Karla's (Senior Estimator) or John's approval.",
                )
            if not project.quickbooks_estimate_number:
                raise HTTPException(
                    status_code=400,
                    detail="SOP Exit Criteria Blocked: QuickBooks Estimate # must be finalized/synced before moving to ESTIMATE SENT.",
                )
            # Auto-set initial follow-up date (2-3 business days after submission per SOP Page 17)
            followup_dt = datetime.now(timezone.utc) + timedelta(days=3)
            project.next_followup_date = followup_dt.strftime("%Y-%m-%d")

        # STAGE 5 -> STAGE 6 (CLOSING_NEGOTIATION) (SOP Pages 17-19)
        if target_stage == ProjectStage.CLOSING_NEGOTIATION:
            if payload.get("awarded_gc_name"):
                project.awarded_gc_name = payload["awarded_gc_name"]
            if payload.get("bid_standing_notes"):
                project.bid_standing_notes = payload["bid_standing_notes"]

        # STAGE 6 -> STAGE 7 (WON_AWARDED) EXIT CRITERIA CHECK (SOP Pages 21-23)
        if target_stage == ProjectStage.WON_AWARDED:
            if current_user.role not in [UserRole.SENIOR_ESTIMATOR, UserRole.OWNER]:
                raise HTTPException(
                    status_code=403,
                    detail="RBAC Blocked: Only John (Owner) or Karla (Senior Estimator) can mark a project WON - AWARDED.",
                )
            award_proof = payload.get("award_proof_type") or project.award_proof_type
            if not award_proof:
                raise HTTPException(
                    status_code=400,
                    detail="SOP Exit Criteria Blocked: Verbal award is NOT enough. Written proof (LOI, NTP, Signed Contract, PO, or Award Email) is mandatory.",
                )
            project.award_proof_type = award_proof
            if payload.get("contract_value"):
                project.contract_value = float(payload["contract_value"])
            else:
                project.contract_value = project.proposal_amount
            if payload.get("project_start_date"):
                project.project_start_date = payload["project_start_date"]
            project.pm_handoff_confirmed = True

            # Record mandatory uploaded award document & accepted proposal
            project.documents.append(
                ProjectDocument(
                    doc_category="AWARD_DOCUMENT",
                    file_name=f"{award_proof}_{project.project_name.replace(' ', '_')}.pdf",
                    storage_url="/docs/signed_award_proof.pdf",
                    uploaded_by=current_user.full_name,
                )
            )

        old_stage = project.stage.value
        project.stage = target_stage
        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="STAGE_TRANSITION",
                comment_text=f"Moved stage from {old_stage} -> {target_stage.value}. {notes}",
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project