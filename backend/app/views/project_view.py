import os
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.user import User, UserRole
from app.models.project import (
    Project,
    ActivityLog,
    ProjectDocument,
    CSICitation,
    SpecifiedManufacturer,
    UploadedSpecDocument,
    AIRecommendation,
    ProjectStage,
)
from app.models.company_settings import CompanySettings
from app.models.ai_feedback import AIFeedbackRule
from app.utils.rbac import get_current_user, require_roles
from app.controllers.ingestion_controller import IngestionController
from app.controllers.triage_controller import TriageController
from app.controllers.estimate_rfq_controller import EstimateRFQController
from app.services.pdf_extractor import PDFExtractorService
from app.services.email_fetcher import EmailFetcherService

router = APIRouter(prefix="/api", tags=["Projects, Triage, Estimates & Settings"])

@router.get("/projects")
async def list_projects(stage: Optional[str] = None):
    from app.services.business_rules import BusinessRulesService
    if stage:
        projects = await Project.find(Project.stage == stage).sort("-updated_at").to_list()
    else:
        projects = await Project.find_all().sort("-updated_at").to_list()

    for p in projects:
        need_save = False
        if not p.distance_check_badge or not p.distance_check_status:
            dist_res = BusinessRulesService.evaluate_distance_vs_footprint(
                p.distance_miles, p.drive_time_hours, p.estimated_sq_ft
            )
            p.distance_check_badge = dist_res["status_badge"]
            p.distance_check_status = dist_res["tier"]
            p.distance_check_notes = dist_res["notes"]
            need_save = True

        gate_res = BusinessRulesService.validate_vital_facts(p.dict())
        if p.has_missing_vital_facts != gate_res["has_missing_vital_facts"] or p.missing_vital_fields != gate_res["missing_fields"]:
            p.has_missing_vital_facts = gate_res["has_missing_vital_facts"]
            p.missing_vital_fields = gate_res["missing_fields"]
            need_save = True

        if need_save:
            await p.save()

    return projects

@router.post("/projects/reset-stage1-bids")
async def reset_stage1_bids():
    """
    Re-arms Atlantic Estimating OS Stage 1 (NEW_BID_INVITE) with fresh dossiers
    directly linked to the real specifications in static/specs.
    """
    from app.services.business_rules import BusinessRulesService

    # 1. Reset Center City Philadelphia Charter High School Gymnasium
    p1 = await Project.find_one(Project.project_name == "Center City Philadelphia Charter High School Gymnasium")
    if p1:
        p1.stage = ProjectStage.NEW_BID_INVITE
        p1.karla_decision = None
        p1.karla_decision_notes = None
        p1.has_unread_addendum = False
        p1.clickup_task_id = None
        p1.clickup_task_url = None
        p1.onedrive_project_folder_url = None
        p1.onedrive_folder_status = None
        p1.ai_recommendation = AIRecommendation.RECOMMEND_BID
        p1.ai_confidence_score = 0.96
        p1.project_drawings_link = "/static/specs/Lower_Merion_High_School_Gym_Spec_096466.pdf"
        p1.documents = [
            ProjectDocument(
                doc_category="SPECIFICATIONS",
                file_name="Lower_Merion_High_School_Gym_Spec_096466.pdf",
                storage_url="/static/specs/Lower_Merion_High_School_Gym_Spec_096466.pdf",
                relevant_sheets=["Section 09 64 66 (p. 142)"],
            )
        ]
        await p1.save()

    # 2. Reset CT Corporation Site Operations & Church Renovation (Resilient Only -> Rejection & Addendum Watchdog)
    p2 = await Project.find_one(Project.project_name == "CT Corporation Site Operations & Church Renovation")
    if p2:
        p2.stage = ProjectStage.NEW_BID_INVITE
        p2.karla_decision = None
        p2.karla_decision_notes = None
        p2.has_unread_addendum = False
        p2.has_target_wood_code = False
        p2.has_resilient_code_only = True
        p2.ai_recommendation = AIRecommendation.RECOMMEND_REJECT
        p2.ai_confidence_score = 0.98
        p2.project_drawings_link = "/static/specs/Allentown_Civic_Center_Resilient_Spec_096566.pdf"
        p2.documents = [
            ProjectDocument(
                doc_category="SPECIFICATIONS",
                file_name="Allentown_Civic_Center_Resilient_Spec_096566.pdf",
                storage_url="/static/specs/Allentown_Civic_Center_Resilient_Spec_096566.pdf",
                relevant_sheets=["Section 09 65 66 (p. 88)"],
            )
        ]
        await p2.save()

    # 3. Reset Mountain View Municipal Annex Stage Repair (Distance vs Footprint Disqualification)
    p3 = await Project.find_one(Project.project_name == "Mountain View Municipal Annex Stage Repair")
    if p3:
        p3.stage = ProjectStage.NEW_BID_INVITE
        p3.karla_decision = None
        p3.karla_decision_notes = None
        p3.has_unread_addendum = False
        p3.ai_recommendation = AIRecommendation.RECOMMEND_REJECT
        p3.ai_confidence_score = 0.95
        await p3.save()

    # 4. Check or create Lower Merion High School Gym Spec Project
    lm_name = "Lower Merion High School Gymnasium Replacement"
    p_lm = await Project.find_one(Project.project_name == lm_name)
    if not p_lm:
        from app.models.project import WorkScopeType, GCInvite
        p_lm = Project(
            project_name=lm_name,
            project_address="301 E Montgomery Ave, Ardmore, PA 19003",
            city="Ardmore",
            state="PA",
            zip_code="19003",
            distance_miles=11.2,
            drive_time_hours=0.4,
            bid_due_date="2026-12-05",
            estimated_project_slot="Summer 2027",
            stage=ProjectStage.NEW_BID_INVITE,
            ai_recommendation=AIRecommendation.RECOMMEND_BID,
            ai_confidence_score=0.97,
            ai_reasoning_summary=(
                "BID RECOMMENDED: CSI 09 64 66 calls for 14,200 SF of MFMA First Grade Northern Hard Maple. "
                "Robbins Bio-Channel Classic Basis of Design specified with Connor & Aacer acceptable. "
                "Convenient 11.2-mile radius from Philadelphia depot (0.4 hr travel)."
            ),
            detected_csi_codes=[
                CSICitation(
                    code="09 64 66",
                    title="Wood Athletic Flooring (Maple Gymnasium System)",
                    document_name="Lower_Merion_High_School_Gym_Spec_096466.pdf",
                    page_number=142,
                    snippet="SECTION 09 64 66 - Provide MFMA 25/32 x 2-1/4 First Grade Hard Maple strip flooring...",
                    is_target_wood=True,
                )
            ],
            has_target_wood_code=True,
            work_type=WorkScopeType.NEW_INSTALLATION,
            flooring_scope_tags=["Wood Athletic 09 64 66", "Maple Gym", "VIP GC"],
            estimated_sq_ft=14200.0,
            architect_firm_name="BartonPartners Architecture",
            specified_manufacturers=[
                SpecifiedManufacturer(
                    manufacturer_name="Robbins Sports Surfaces",
                    product_line="Bio-Channel Classic Maple",
                    is_basis_of_design=True,
                    or_equal_allowed=True,
                ),
                SpecifiedManufacturer(
                    manufacturer_name="Connor Sports",
                    product_line="NeoShok Maple System",
                    is_basis_of_design=False,
                    or_equal_allowed=True,
                ),
            ],
            project_drawings_link="/static/specs/Lower_Merion_High_School_Gym_Spec_096466.pdf",
            platform_tags=["Direct Email", "BuildingConnected"],
            gc_invites=[
                GCInvite(
                    gc_company_name="Skanska USA Building",
                    gc_contact_name="David Alston",
                    gc_contact_email="dalston@skanska.com",
                    source_platform="Direct Email",
                ),
                GCInvite(
                    gc_company_name="LF Driscoll",
                    gc_contact_name="Sarah Jenkins",
                    source_platform="BuildingConnected",
                ),
            ],
            documents=[
                ProjectDocument(
                    doc_category="SPECIFICATIONS",
                    file_name="Lower_Merion_High_School_Gym_Spec_096466.pdf",
                    storage_url="/static/specs/Lower_Merion_High_School_Gym_Spec_096466.pdf",
                    relevant_sheets=["Section 09 64 66 (p. 142)", "A103"],
                )
            ],
            activity_logs=[
                ActivityLog(
                    actor_name="System Initializer",
                    actor_role="ADMIN",
                    action_type="STAGE1_SEEDED",
                    comment_text="Seeded fresh Stage 1 bid linked to Lower_Merion_High_School_Gym_Spec_096466.pdf for Karla triage.",
                )
            ],
        )
        await p_lm.insert()
    else:
        p_lm.stage = ProjectStage.NEW_BID_INVITE
        p_lm.karla_decision = None
        p_lm.karla_decision_notes = None
        p_lm.has_unread_addendum = False
        await p_lm.save()

    return {"status": "success", "message": "Stage 1 bids re-armed successfully."}

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/projects/{project_id}")
async def update_project_fields(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    editable_fields = [
        "project_name", "project_address", "city", "state", "zip_code",
        "bid_due_date", "estimated_project_slot", "sales_tax_status",
        "bid_type", "pla_status", "buy_america_status", "bond_required",
        "insurance_required", "labor_type", "project_drawings_link",
        "takeoff_folder_link", "takeoff_summary_comment", "quickbooks_estimate_number",
        "proposal_amount", "competing_flooring_bidders", "next_followup_date",
        "awarded_gc_name", "bid_standing_notes", "contract_value",
        "project_start_date", "award_proof_type", "win_probability_tier",
        "architect_firm_name"
    ]
    changed = []
    for field in editable_fields:
        if field in payload:
            setattr(project, field, payload[field])
            changed.append(field)

    if changed:
        project.activity_logs.insert(
            0,
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="FIELDS_UPDATED",
                comment_text=f"Updated database fields: {', '.join(changed)}.",
            ),
        )
        project.updated_at = datetime.now(timezone.utc)
        await project.save()
    return project

@router.post("/ingest")
async def ingest_bid(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    return await IngestionController.ingest_bid_invite(payload, current_user)

@router.post("/projects/{project_id}/addendum")
async def upload_addendum(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    return await IngestionController.process_addendum_upload(project_id, payload, current_user)

# KARLA / JOHN RBAC PROTECTED TRIAGE ENDPOINT
@router.post("/triage/{project_id}/decision")
async def karla_triage_decision(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles([UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])),
):
    return await TriageController.submit_karla_decision(project_id, payload, current_user)

@router.post("/projects/{project_id}/provision-clickup-onedrive")
async def provision_clickup_onedrive(
    project_id: str,
    current_user: User = Depends(get_current_user),
):
    return await TriageController.provision_clickup_and_onedrive(project_id, current_user)

@router.post("/projects/{project_id}/approve")
async def approve_project_stage1(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles([UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])),
):
    payload["decision"] = "APPROVED"
    return await TriageController.submit_karla_decision(project_id, payload, current_user)

@router.post("/projects/{project_id}/reject")
async def reject_project_stage1(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles([UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])),
):
    payload["decision"] = "REJECTED"
    return await TriageController.submit_karla_decision(project_id, payload, current_user)

@router.post("/projects/{project_id}/resolve-exception")
async def resolve_gatekeeper_exception_endpoint(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles([UserRole.SENIOR_ESTIMATOR, UserRole.OWNER, UserRole.ESTIMATOR])),
):
    return await TriageController.resolve_gatekeeper_exception(project_id, payload, current_user)

@router.post("/projects/{project_id}/addendum")
@router.post("/projects/{project_id}/simulate-addendum")
async def simulate_addendum_endpoint(
    project_id: str,
    payload: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
):
    if not payload:
        payload = {
            "addendum_number": 2,
            "introduces_wood_code_096466": True,
            "file_name": "Addendum_02_Flooring_Change_To_Maple_096466.pdf",
            "summary": "Architect issued Addendum #2 changing Gymnasium from 09 65 66 Synthetic Resilient to 09 64 66 Maple Wood Athletic Flooring (9,200 SF).",
        }
    return await IngestionController.process_addendum_upload(project_id, payload, current_user)

@router.post("/projects/{project_id}/takeoff")
async def update_takeoff(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(
        require_roles([UserRole.ESTIMATOR, UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])
    ),
):
    return await EstimateRFQController.save_takeoff_and_seed_estimate(project_id, payload, current_user)

@router.post("/projects/{project_id}/courtesy-rom")
async def create_courtesy_rom(
    project_id: str,
    current_user: User = Depends(
        require_roles([UserRole.ESTIMATOR, UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])
    ),
):
    return await EstimateRFQController.generate_courtesy_rom_estimate(project_id, current_user)

@router.post("/projects/{project_id}/rfqs/dispatch")
async def dispatch_rfqs(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(
        require_roles([UserRole.SENIOR_ESTIMATOR, UserRole.OWNER, UserRole.ESTIMATOR])
    ),
):
    return await EstimateRFQController.dispatch_manufacturer_rfqs(project_id, payload, current_user)

# KARLA / JOHN RBAC PROTECTED QUOTE APPLICATION & PRICING ENDPOINTS
@router.post("/projects/{project_id}/rfqs/{rfq_id}/apply")
async def apply_vendor_quote(
    project_id: str,
    rfq_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles([UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])),
):
    return await EstimateRFQController.record_and_apply_vendor_quote(
        project_id, rfq_id, payload, current_user
    )

@router.post("/projects/{project_id}/estimate")
async def save_or_sync_estimate(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(
        require_roles([UserRole.ESTIMATOR, UserRole.SENIOR_ESTIMATOR, UserRole.OWNER])
    ),
):
    return await EstimateRFQController.update_estimate_version_and_sync_qbo(
        project_id, payload, current_user
    )

@router.post("/projects/{project_id}/transition")
async def transition_stage(
    project_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    return await EstimateRFQController.transition_project_stage(project_id, payload, current_user)

@router.get("/settings")
async def get_settings_and_rules():
    config = await CompanySettings.find_one()
    if not config:
        config = CompanySettings()
        await config.insert()
    rules = await AIFeedbackRule.find_all().sort("-created_at").to_list()
    return {"settings": config, "feedback_rules": rules}

@router.put("/settings")
async def update_company_settings(
    payload: Dict[str, Any],
    current_user: User = Depends(require_roles([UserRole.OWNER, UserRole.SENIOR_ESTIMATOR])),
):
    config = await CompanySettings.find_one()
    if not config:
        config = CompanySettings()
    for k, v in payload.items():
        if hasattr(config, k):
            setattr(config, k, v)
    await config.save()
    return config

# OUTLOOK & BID PORTAL INTAKE CENTER (Box 1 in Architecture Diagram)
MOCK_INBOX_EMAILS = [
    {
        "id": "email-vf-01",
        "sender": "bids@planhub.com",
        "sender_name": "PlanHub Notification Desk",
        "subject": "INVITE TO BID: Valley Forge Athletic Center - Main & Aux Maple Gymnasium (18,500 SF)",
        "source_platform": "PlanHub",
        "gc_company_name": "LF Driscoll Construction",
        "gc_contact_name": "Marcus Vance",
        "gc_contact_email": "mvance@lfdriscoll.com",
        "project_name": "Valley Forge Athletic Complex Gymnasium Expansion",
        "project_address": "1150 1st Ave, King of Prussia, PA 19406",
        "city": "King of Prussia",
        "state": "PA",
        "zip_code": "19406",
        "distance_miles": 21.8,
        "drive_time_hours": 0.6,
        "bid_due_date": "2026-11-28",
        "estimated_project_slot": "Summer 2027",
        "estimated_sq_ft": 18500.0,
        "architect_firm_name": "EwingCole Sports Architecture",
        "sales_tax_status": "Tax Exempt",
        "bid_type": "Open Bid",
        "labor_type": "Prevailing Wage",
        "attachments": ["Div09_Finishes_Spec.pdf", "A101_MainGym_Plan.pdf", "Finish_Schedule_A108.pdf"],
        "detected_csi_codes": [
            {
                "code": "09 64 66",
                "title": "Wood Athletic Flooring (Northern Hard Maple)",
                "document_name": "Div09_Finishes_Spec.pdf",
                "page_number": 112,
                "snippet": "SECTION 09 64 66 - Provide MFMA 25/32 x 2-1/4 First Grade Hard Maple strip flooring over anchored resilient subfloor...",
                "is_target_wood": True,
            }
        ],
        "specified_manufacturers": [
            {"manufacturer_name": "Robbins Sports Surfaces", "product_line": "Bio-Cushion Classic", "is_basis_of_design": True, "or_equal_allowed": True},
            {"manufacturer_name": "Connor Sports", "product_line": "RezillChannel", "is_basis_of_design": False, "or_equal_allowed": True}
        ],
        "raw_body_snippet": "Hello Karla, LF Driscoll is inviting Atlantic Flooring to bid on Division 09 Wood Athletic Flooring for the Valley Forge Athletic Complex. Bids due Nov 28."
    },
    {
        "id": "email-lm-02",
        "sender": "estimating@skanska.com",
        "sender_name": "Skanska USA Building",
        "subject": "Subcontractor RFP: Lower Merion Community Gymnasium Sand & Refinish (8,400 SF)",
        "source_platform": "Direct Email",
        "gc_company_name": "Skanska USA",
        "gc_contact_name": "David Alston",
        "gc_contact_email": "dalston@skanska.com",
        "project_name": "Lower Merion Community Center Main Gymnasium Refinishing",
        "project_address": "75 E Lancaster Ave, Ardmore, PA 19003",
        "city": "Ardmore",
        "state": "PA",
        "zip_code": "19003",
        "distance_miles": 11.2,
        "drive_time_hours": 0.4,
        "bid_due_date": "2026-12-05",
        "estimated_project_slot": "Summer 2027",
        "estimated_sq_ft": 8400.0,
        "architect_firm_name": "BartonPartners Architecture",
        "sales_tax_status": "Tax Exempt",
        "bid_type": "Sealed Bid",
        "labor_type": "Prevailing Wage",
        "attachments": ["LM_Gym_Spec_Refinish.pdf", "Floor_Condition_Assessment.pdf"],
        "detected_csi_codes": [
            {
                "code": "09 64 00",
                "title": "Wood Flooring Refinishing & Game Lines",
                "document_name": "LM_Gym_Spec_Refinish.pdf",
                "page_number": 45,
                "snippet": "SECTION 09 64 00 - Drum sand, screen, seal, and apply MFMA approved polyurethane finish and multi-court game striping...",
                "is_target_wood": True,
            }
        ],
        "specified_manufacturers": [
            {"manufacturer_name": "Bona US", "product_line": "SuperCourt Athletic Finishing System", "is_basis_of_design": True, "or_equal_allowed": True}
        ],
        "raw_body_snippet": "Karla - Please provide a firm lump sum bid to sand, seal, finish and repaint NCAA regulation game lines for the Lower Merion gym."
    },
    {
        "id": "email-poc-03",
        "sender": "alerts@dodgeconstruction.com",
        "sender_name": "Dodge Network Alerts",
        "subject": "DODGE ALERT: Pocono Warehouse Mezzanine Flooring - Synthetic Rubber Sheet (300 SF)",
        "source_platform": "Dodge",
        "gc_company_name": "Northeast Industrial GC",
        "gc_contact_name": "Robert Klein",
        "gc_contact_email": "rklein@neindustrial.com",
        "project_name": "Pocono Regional Warehouse Mezzanine Storage Room",
        "project_address": "880 Industrial Dr, Stroudsburg, PA 18360",
        "city": "Stroudsburg",
        "state": "PA",
        "zip_code": "18360",
        "distance_miles": 98.0,
        "drive_time_hours": 2.2,
        "bid_due_date": "2026-11-20",
        "estimated_project_slot": "Spring 2027",
        "estimated_sq_ft": 300.0,
        "architect_firm_name": "Penn Logistics Design",
        "sales_tax_status": "Full Sales Tax",
        "bid_type": "Open Bid",
        "labor_type": "Open Shop",
        "attachments": ["Pocono_Spec_Div09.pdf"],
        "detected_csi_codes": [
            {
                "code": "09 65 66",
                "title": "Resilient Athletic Flooring (Rubber Mezzanine)",
                "document_name": "Pocono_Spec_Div09.pdf",
                "page_number": 19,
                "snippet": "SECTION 09 65 66 - Resilient Athletic & Weight Room Sheet Flooring. No hardwood maple permitted in this facility.",
                "is_target_wood": False,
            }
        ],
        "specified_manufacturers": [],
        "raw_body_snippet": "New Public Works Lead: 300 SF resilient rubber mezzanine flooring. 98 miles from Philadelphia."
    }
]

@router.get("/intake/inbox")
async def get_intake_inbox():
    return {
        "unread_inbox_count": 62,
        "active_sync_sources": ["Outlook 365 (karla@atlanticflooring.com)", "PlanHub API", "Dodge Network", "ConstructConnect"],
        "pending_emails": MOCK_INBOX_EMAILS,
    }

@router.post("/intake/process-email")
async def process_email_intake(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    email_id = payload.get("email_id")
    match = next((e for e in MOCK_INBOX_EMAILS if e["id"] == email_id), None)
    if not match:
        # If custom payload provided, ingest that
        return await IngestionController.ingest_bid_invite(payload, current_user)
    
    # Ingest the matched email payload
    return await IngestionController.ingest_bid_invite(match, current_user)

@router.get("/email/diagnostics")
async def get_email_diagnostics():
    """
    Returns live connection telemetry for Microsoft Graph API & portal scrapers.
    """
    return await EmailFetcherService.get_connection_diagnostics()

@router.get("/documents/spec-files")
async def list_spec_files():
    """
    Lists real CSI Division 09 specification files stored in the system.
    """
    specs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "specs")
    if not os.path.exists(specs_dir):
        return []

    results = []
    files = [f for f in os.listdir(specs_dir) if f.lower().endswith(".pdf")]
    
    # Metadata map for known demo specs
    metadata_map = {
        "Lower_Merion_High_School_Gym_Spec_096466.pdf": {
            "title": "Lower Merion High School Gym Spec (CSI 09 64 66)",
            "territory": "Lower Merion, PA (Montgomery County)",
            "system_type": "Maple Wood Athletic Flooring (Robbins Bio-Channel)",
            "area_sf": 14200,
            "qualification_status": "RECOMMEND_BID",
            "associated_project": "Lower Merion High School Gymnasium Refinishing & New Floor"
        },
        "Allentown_Civic_Center_Resilient_Spec_096566.pdf": {
            "title": "Allentown Civic Center Resilient Spec (CSI 09 65 66)",
            "territory": "Allentown, PA (Lehigh County)",
            "system_type": "Synthetic Rubber / Resilient (Wood Excluded)",
            "area_sf": 8500,
            "qualification_status": "AUTO_DISQUALIFY",
            "associated_project": "Allentown Civic Center Resilient Floor"
        },
        "Pavilion_CSD_High_School_Gym_Spec_096400.pdf": {
            "title": "Pavilion CSD High School Gym Spec (CSI 09 64 00)",
            "territory": "Pavilion, NY (Genesee County)",
            "system_type": "Maple Sand, Screen & Refinish + Game Lines (Bona SuperCourt)",
            "area_sf": 10214,
            "qualification_status": "RECOMMEND_BID",
            "associated_project": "Pavilion Central School District High School Gym Floor Refinishing"
        }
    }

    for filename in sorted(files):
        file_path = os.path.join(specs_dir, filename)
        file_size = os.path.getsize(file_path)
        meta = metadata_map.get(filename, {
            "title": filename.replace("_", " ").replace(".pdf", ""),
            "territory": "Mid-Atlantic Division",
            "system_type": "CSI Division 09 Document",
            "area_sf": 0,
            "qualification_status": "UNKNOWN",
            "associated_project": "Uploaded Spec Document"
        })
        
        # Run extractor to get live parsed intelligence
        analysis = PDFExtractorService.extract_spec_from_file_path(file_path)
        ai_synthesis = await PDFExtractorService.generate_ai_plain_english_summary(analysis)
        
        results.append({
            "filename": filename,
            "file_url": f"/static/specs/{filename}",
            "file_size_bytes": file_size,
            "metadata": meta,
            "analysis": analysis,
            "ai_synthesis": ai_synthesis,
        })

    # Also query MongoDB for dynamically uploaded spec documents
    mongo_uploaded_docs = await UploadedSpecDocument.find_all().to_list()
    for mdoc in mongo_uploaded_docs:
        if not any(r["filename"] == mdoc.filename for r in results):
            results.append({
                "filename": mdoc.filename,
                "file_url": mdoc.storage_url,
                "file_size_bytes": mdoc.file_size_bytes,
                "metadata": {
                    "title": mdoc.filename.replace("_", " ").replace(".pdf", ""),
                    "territory": "Karla Delaet Manual Upload",
                    "system_type": "Wood Athletic System" if mdoc.extracted_intelligence.get("has_target_wood_code") else "Resilient / Non-Wood",
                    "area_sf": mdoc.estimated_sq_ft,
                    "qualification_status": mdoc.ai_recommendation,
                    "associated_project": f"Uploaded: {mdoc.filename}",
                },
                "analysis": mdoc.extracted_intelligence,
                "ai_synthesis": {
                    "ai_confirmation": mdoc.ai_confirmation,
                    "ai_recommendation": mdoc.ai_recommendation,
                    "ai_confidence_score": 0.98,
                    "plain_english_summary": mdoc.ai_summary,
                    "important_spec_excerpts": [],
                },
                "mongo_id": str(mdoc.id),
            })

    return results

@router.post("/documents/upload-and-analyze")
async def upload_and_analyze_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Accepts manual spec manual / drawing upload from Karla.
    Performs instant PyMuPDF text & CSI extraction, generates plain-English AI summary,
    and stores the document directly into MongoDB Atlas.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF specification documents are supported.")

    specs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "specs")
    os.makedirs(specs_dir, exist_ok=True)
    
    # Clean filename
    safe_name = os.path.basename(file.filename).replace(" ", "_")
    target_path = os.path.join(specs_dir, safe_name)
    
    content = await file.read()
    with open(target_path, "wb") as f:
        f.write(content)

    # 1. Perform PyMuPDF deep extraction
    analysis = PDFExtractorService.extract_spec_intelligence(content, safe_name)

    # 2. Feed extracted CSI codes & text to AI to generate confirmation & plain-English summary
    ai_synthesis = await PDFExtractorService.generate_ai_plain_english_summary(analysis)

    # 3. Persist document record and intelligence into MongoDB Atlas
    uploaded_doc = UploadedSpecDocument(
        filename=safe_name,
        file_size_bytes=len(content),
        storage_url=f"/static/specs/{safe_name}",
        uploaded_by=current_user.full_name,
        extracted_intelligence=analysis,
        ai_confirmation=ai_synthesis["ai_confirmation"],
        ai_summary=ai_synthesis["plain_english_summary"],
        ai_model_name=ai_synthesis.get("ai_model_name", "Google Gemini 1.5 Flash"),
        ai_recommendation=ai_synthesis["ai_recommendation"],
        detected_csi_codes=[CSICitation(**c) for c in analysis.get("detected_csi_codes", [])],
        specified_manufacturers=[SpecifiedManufacturer(**m) for m in analysis.get("specified_manufacturers", [])],
        estimated_sq_ft=analysis.get("estimated_sq_ft", 0.0),
        work_type=analysis.get("work_type", "UNKNOWN_OR_NONE"),
    )
    await uploaded_doc.insert()

    # 4. Automatically provision Stage 1 Project in MongoDB so Karla can triage it immediately
    clean_title = safe_name.replace("_", " ").replace(".pdf", "")
    new_proj = Project(
        project_name=f"{clean_title} (Karla Upload)",
        project_address="100 Innovation Way, Wayne, PA 19087",
        city="Wayne",
        state="PA",
        zip_code="19087",
        distance_miles=18.0,
        drive_time_hours=0.5,
        bid_due_date="2026-12-15",
        estimated_project_slot="Summer 2027",
        stage=ProjectStage.NEW_BID_INVITE,
        ai_recommendation=AIRecommendation(ai_synthesis["ai_recommendation"]),
        ai_confidence_score=ai_synthesis["ai_confidence_score"],
        ai_reasoning_summary=ai_synthesis["plain_english_summary"],
        ai_model_name=ai_synthesis.get("ai_model_name", "Google Gemini 1.5 Flash"),
        detected_csi_codes=[CSICitation(**c) for c in analysis.get("detected_csi_codes", [])],
        specified_manufacturers=[SpecifiedManufacturer(**m) for m in analysis.get("specified_manufacturers", [])],
        estimated_sq_ft=analysis.get("estimated_sq_ft", 0.0),
        has_target_wood_code=analysis.get("has_target_wood_code", False),
        has_resilient_code_only=analysis.get("has_resilient_code_only", False),
        project_drawings_link=f"/static/specs/{safe_name}",
        platform_tags=["Karla Manual Upload"],
        documents=[
            ProjectDocument(
                doc_category="SPECIFICATIONS",
                file_name=safe_name,
                storage_url=f"/static/specs/{safe_name}",
                relevant_sheets=[fs.get("sheet", "") for fs in analysis.get("finish_schedule_extracted", []) if fs.get("sheet")],
                uploaded_by=current_user.full_name,
            )
        ],
        activity_logs=[
            ActivityLog(
                actor_name=current_user.full_name,
                actor_role=current_user.role.value,
                action_type="MANUAL_SPEC_UPLOADED",
                comment_text=f"Karla uploaded spec PDF '{safe_name}'. PyMuPDF extracted CSI codes and AI confirmed scope: {ai_synthesis['ai_confirmation']}.",
            )
        ],
    )
    await new_proj.insert()

    return {
        "success": True,
        "filename": safe_name,
        "file_url": f"/static/specs/{safe_name}",
        "file_size_bytes": len(content),
        "analysis": analysis,
        "ai_synthesis": ai_synthesis,
        "mongo_doc_id": str(uploaded_doc.id),
        "project_id": str(new_proj.id),
    }
