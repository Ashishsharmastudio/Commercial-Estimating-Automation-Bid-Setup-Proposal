from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import HTTPException
from app.models.project import Project, ProjectStage, ActivityLog
from app.models.ai_feedback import AIFeedbackRule
from app.models.user import User
from app.services.automation_service import AutomationService
from app.services.business_rules import BusinessRulesService

class TriageController:
    @staticmethod
    async def submit_karla_decision(
        project_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        decision = payload.get("decision", "").upper()  # "APPROVED" or "REJECTED"
        notes = payload.get("notes", "").strip()
        save_as_ai_rule = bool(payload.get("save_as_ai_rule", True))
        rule_category = payload.get("rule_category", "SCOPE_AND_LOGISTICS")

        if decision not in ["APPROVED", "REJECTED"]:
            raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")

        project.karla_decision = decision
        project.karla_decision_notes = notes
        project.karla_reviewed_at = datetime.now(timezone.utc)
        project.has_unread_addendum = False

        if decision == "APPROVED":
            project.stage = ProjectStage.QUALIFIED
            if "Qualified" not in project.flooring_scope_tags:
                project.flooring_scope_tags.append("Qualified")

            # Assigned Estimator and Summer Slot from Approval Drawer
            assigned_estimator = payload.get("assigned_estimator", project.assigned_estimator or "Karla Delaet")
            estimated_project_slot = payload.get("estimated_project_slot", project.estimated_project_slot or "Summer 2027")
            project.assigned_estimator = assigned_estimator
            project.estimated_project_slot = estimated_project_slot

            # Layer 4 Automation: OneDrive 5-Folder Architecture Setup
            city_val = project.city or project.project_address or "Regional"
            od_res = AutomationService.provision_onedrive_folders(
                project_name=project.project_name,
                city=city_val,
            )
            project.onedrive_project_folder_url = od_res["onedrive_project_folder_url"]
            project.onedrive_folder_status = od_res["onedrive_folder_status"]
            project.onedrive_provisioned_at = datetime.now(timezone.utc)
            project.onedrive_subfolders = od_res["subfolders_created"]
            if not project.takeoff_folder_link:
                project.takeoff_folder_link = f"{od_res['onedrive_project_folder_url']}/04_Estimating_Takeoff"

            # Layer 4 Automation: ClickUp Task Creation with Custom Fields
            primary_csi = project.detected_csi_codes[0].code if project.detected_csi_codes else "09 64 66"
            bod_name = project.specified_manufacturers[0].manufacturer_name if project.specified_manufacturers else "Robbins / Connor Maple"
            gc_names = [gc.gc_company_name for gc in project.gc_invites]

            cu_res = AutomationService.provision_clickup_task(
                project_name=project.project_name,
                bid_due_date=project.bid_due_date,
                estimated_sq_ft=project.estimated_sq_ft,
                csi_code=primary_csi,
                bod_manufacturer=bod_name,
                gc_list=gc_names,
                onedrive_url=project.onedrive_project_folder_url,
                assigned_estimator=assigned_estimator,
            )
            project.clickup_task_id = cu_res["clickup_task_id"]
            project.clickup_task_url = cu_res["clickup_task_url"]
            project.clickup_status = cu_res["clickup_status"]
            project.clickup_synced_at = datetime.now(timezone.utc)

            # Layer 4 Automation: Secure Permanent Audit Ledger Log
            audit_entry = AutomationService.record_audit_entry(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="STAGE1_APPROVAL_DISPATCHED",
                comment_text=(
                    f"Karla APPROVED bid qualification -> Moved to Stage 2 (QUALIFIED). "
                    f"Assigned: {assigned_estimator} | Slot: {estimated_project_slot}. "
                    f"Automated OneDrive: 5 subfolders ({', '.join(od_res['subfolders_created'])}). "
                    f"Automated ClickUp: Task {project.clickup_task_id} with custom fields. "
                    f"Notes: {notes or 'Scope verified.'}"
                ),
                metadata={
                    "clickup_task_id": project.clickup_task_id,
                    "onedrive_url": project.onedrive_project_folder_url,
                    "assigned_estimator": assigned_estimator,
                    "estimated_project_slot": estimated_project_slot,
                },
            )
            project.activity_logs.insert(
                0,
                ActivityLog(
                    actor_name=audit_entry["actor_name"],
                    actor_role=audit_entry["actor_role"],
                    action_type=audit_entry["action_type"],
                    comment_text=audit_entry["comment_text"],
                ),
            )
        else:
            rejection_chip = payload.get("rejection_chip", "Non-Wood Scope")
            project.stage = ProjectStage.NO_BID_REJECTED
            project.rejection_chip = rejection_chip
            if "Qualified" in project.flooring_scope_tags:
                project.flooring_scope_tags.remove("Qualified")

            action_comment = (
                f"Karla REJECTED bid [{rejection_chip}] -> Moved to Disqualified / Watchlist. "
                f"Addendum Watchdog remains active. Reason: {notes or rejection_chip}."
            )
            if save_as_ai_rule and notes:
                new_rule = AIFeedbackRule(
                    source_project_id=str(project.id),
                    source_project_name=project.project_name,
                    rule_category=rule_category,
                    natural_language_rule=f"[{rejection_chip}] {notes}",
                    created_by=current_user.full_name,
                )
                await new_rule.insert()

            project.activity_logs.insert(
                0,
                ActivityLog(
                    actor_name=current_user.full_name,
                    actor_role=current_user.role.value,
                    action_type=f"TRIAGE_{decision}",
                    comment_text=action_comment,
                ),
            )

        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def resolve_gatekeeper_exception(
        project_id: str, payload: Dict[str, Any], current_user: User
    ) -> Project:
        """
        The Data Gatekeeper Quick-Fix:
        Allows Karla to supply missing vital facts (due date, estimated gym SF, address)
        and immediately re-evaluates the business rules to unblock the bid.
        """
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        updates = []
        if "bid_due_date" in payload and payload["bid_due_date"]:
            project.bid_due_date = payload["bid_due_date"]
            updates.append(f"Due Date -> {project.bid_due_date}")

        if "estimated_sq_ft" in payload and float(payload["estimated_sq_ft"] or 0) > 0:
            project.estimated_sq_ft = float(payload["estimated_sq_ft"])
            updates.append(f"Gym Footprint -> {int(project.estimated_sq_ft):,} SF")

        if "project_address" in payload and payload["project_address"]:
            project.project_address = payload["project_address"]
            updates.append(f"Address -> {project.project_address}")

        if "city" in payload and payload["city"]:
            project.city = payload["city"]

        # Re-evaluate The Data Gatekeeper
        gatekeeper_res = BusinessRulesService.validate_vital_facts(project.dict())
        project.has_missing_vital_facts = gatekeeper_res["has_missing_vital_facts"]
        project.missing_vital_fields = gatekeeper_res["missing_fields"]

        # Re-evaluate Distance-vs-Footprint Check
        dist_res = BusinessRulesService.evaluate_distance_vs_footprint(
            distance_miles=project.distance_miles,
            drive_time_hours=project.drive_time_hours,
            estimated_sq_ft=project.estimated_sq_ft,
        )
        project.distance_check_badge = dist_res["status_badge"]
        project.distance_check_status = dist_res["tier"]
        project.distance_check_notes = dist_res["notes"]

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="GATEKEEPER_EXCEPTION_RESOLVED",
                comment_text=(
                    f"Resolved Gatekeeper exceptions ({', '.join(updates)}). "
                    f"Gatekeeper status: {gatekeeper_res['gatekeeper_status']}. "
                    f"Distance check: {project.distance_check_badge}."
                ),
            ),
        )

        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project

    @staticmethod
    async def provision_clickup_and_onedrive(project_id: str, current_user: User) -> Project:
        project = await Project.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Layer 4 Automation: OneDrive 5-Folder Setup
        city_val = project.city or project.project_address or "Regional"
        od_res = AutomationService.provision_onedrive_folders(
            project_name=project.project_name,
            city=city_val,
        )
        project.onedrive_project_folder_url = od_res["onedrive_project_folder_url"]
        project.onedrive_folder_status = od_res["onedrive_folder_status"]
        project.onedrive_provisioned_at = datetime.now(timezone.utc)
        project.onedrive_subfolders = od_res["subfolders_created"]
        if not project.takeoff_folder_link:
            project.takeoff_folder_link = f"{od_res['onedrive_project_folder_url']}/04_Estimating_Takeoff"

        # Layer 4 Automation: ClickUp Task Creation
        primary_csi = project.detected_csi_codes[0].code if project.detected_csi_codes else "09 64 66"
        bod_name = project.specified_manufacturers[0].manufacturer_name if project.specified_manufacturers else "Robbins / Connor Maple"
        gc_names = [gc.gc_company_name for gc in project.gc_invites]

        cu_res = AutomationService.provision_clickup_task(
            project_name=project.project_name,
            bid_due_date=project.bid_due_date,
            estimated_sq_ft=project.estimated_sq_ft,
            csi_code=primary_csi,
            bod_manufacturer=bod_name,
            gc_list=gc_names,
            onedrive_url=project.onedrive_project_folder_url,
            assigned_estimator=project.assigned_estimator or "Karla Delaet",
        )
        project.clickup_task_id = cu_res["clickup_task_id"]
        project.clickup_task_url = cu_res["clickup_task_url"]
        project.clickup_status = cu_res["clickup_status"]
        project.clickup_synced_at = datetime.now(timezone.utc)

        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="MANUAL_PROVISION_TRIGGERED",
                comment_text=(
                    f"Manually provisioned ClickUp task {project.clickup_task_id} & "
                    f"OneDrive 5-folder structure ({', '.join(od_res['subfolders_created'])})."
                ),
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
        return project