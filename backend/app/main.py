from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.models.user import User, UserRole
from app.models.company_settings import CompanySettings
from app.models.ai_feedback import AIFeedbackRule
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
    TakeoffItem,
    VendorRFQQuote,
    EstimateLineItem,
    EstimateVersion,
    ActivityLog,
)
from app.controllers.estimate_rfq_controller import EstimateRFQController
from app.views.auth_view import router as auth_router
from app.views.project_view import router as project_router

async def seed_initial_data():
    if await User.count() == 0:
        await User.insert_many(
            [
                User(
                    full_name="Karla Delaet",
                    email="karla@atlanticflooring.com",
                    role=UserRole.SENIOR_ESTIMATOR,
                    title="Senior Estimator & Sole Triage Gatekeeper",
                ),
                User(
                    full_name="John (Owner)",
                    email="john@atlanticflooring.com",
                    role=UserRole.OWNER,
                    title="President & Owner",
                ),
                User(
                    full_name="Takeoff / Follow-Up Staff",
                    email="estimator@atlanticflooring.com",
                    role=UserRole.ESTIMATOR,
                    title="Junior Takeoff & Follow-Up Coordinator",
                ),
                User(
                    full_name="AI Ingestion Agent",
                    email="ai@atlanticflooring.com",
                    role=UserRole.AI_WORKER,
                    title="Autonomous Spec & Portal Agent",
                ),
            ]
        )

    if await CompanySettings.count() == 0:
        await CompanySettings().insert()

    if await AIFeedbackRule.count() == 0:
        await AIFeedbackRule.insert_many(
            [
                AIFeedbackRule(
                    source_project_name="CT Corporation Site Operations Center",
                    rule_category="CSI_CODE",
                    natural_language_rule="Reject projects with only CSI 09 65 66 (Resilient Athletic Flooring) unless wood flooring 09 64 00 / 09 64 66 is also specified.",
                    created_by="Karla Delaet",
                ),
                AIFeedbackRule(
                    source_project_name="Upstate Small Room Annex",
                    rule_category="DISTANCE_VS_SIZE",
                    natural_language_rule="Reject footprints under 500 sq ft when driving distance exceeds 3 hours due to shipping and mobilization overhead.",
                    created_by="Karla Delaet",
                ),
            ]
        )

    if await Project.count() == 0:
        # Project 1: Center City Philadelphia Charter HS (Triage Queue - RECOMMEND BID, Multi-GC, 4 Manufacturers)
        p1 = Project(
            project_name="Center City Philadelphia Charter High School Gymnasium",
            project_address="1400 JFK Blvd, Philadelphia, PA 19102",
            city="Philadelphia",
            state="PA",
            zip_code="19102",
            distance_miles=12.4,
            drive_time_hours=0.4,
            bid_due_date="2026-11-15",
            estimated_project_slot="Summer 2027",
            stage=ProjectStage.NEW_BID_INVITE,
            ai_recommendation=AIRecommendation.RECOMMEND_BID,
            ai_confidence_score=0.96,
            ai_reasoning_summary=(
                "BID RECOMMENDED: Spec Section 09 64 66 calls for 12,400 SF of New Maple Wood Athletic "
                "Flooring on Sheets A103 & A106. Located 12.4 miles from Center City HQ (0.4 hr drive). "
                "Invited by 3 separate GCs (Turner, LF Driscoll, CT Corp)—automatically deduplicated into 1 record."
            ),
            detected_csi_codes=[
                CSICitation(
                    code="09 64 66",
                    title="Wood Athletic Flooring (Maple Gymnasium System)",
                    document_name="01_Project_Manual_Div09.pdf",
                    page_number=142,
                    snippet="SECTION 09 64 66 - WOOD ATHLETIC FLOORING: Provide 25/32-inch x 2-1/4-inch MFMA First Grade Northern Hard Maple strip flooring...",
                    is_target_wood=True,
                )
            ],
            has_target_wood_code=True,
            work_type=WorkScopeType.NEW_INSTALLATION,
            flooring_scope_tags=["Wood Athletic 09 64 66", "New Installation", "VIP GC"],
            estimated_sq_ft=12400.0,
            architect_firm_name="Kimmel Bogrette Architecture",
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
                SpecifiedManufacturer(
                    manufacturer_name="Action Floor Systems",
                    product_line="Action Thrust I",
                    is_basis_of_design=False,
                    or_equal_allowed=True,
                ),
                SpecifiedManufacturer(
                    manufacturer_name="Aacer Flooring",
                    product_line="AacerChannel VLP",
                    is_basis_of_design=False,
                    or_equal_allowed=True,
                ),
            ],
            finish_schedule_extracted=[
                {"sheet": "A103", "room": "101 Main Gym", "material": "WD-1 Maple Athletic", "sq_ft": 10200},
                {"sheet": "A106", "room": "104 Auxiliary Fitness", "material": "WD-1 Maple Athletic", "sq_ft": 2200},
            ],
            is_prescreened_gc_invite=True,
            platform_tags=["Direct Email", "PlanHub", "BuildingConnected"],
            sales_tax_status="Tax Exempt",
            bid_type="Sealed Bid",
            pla_status="Yes",
            buy_america_status="Yes",
            bond_required="Yes",
            insurance_required="Yes",
            labor_type="Prevailing Wage",
            competing_flooring_bidders=["Tri-State Sports Floors", "Apex Wood Floors"],
            project_drawings_link="https://planhub.com/projects/philly-charter-gym-drawings",
            gc_invites=[
                GCInvite(
                    gc_company_name="Turner Construction",
                    gc_contact_name="Mike Vance",
                    gc_contact_email="mvance@turner.com",
                    source_platform="Direct Email",
                    gc_specific_due_date="2026-11-15",
                ),
                GCInvite(
                    gc_company_name="LF Driscoll",
                    gc_contact_name="Sarah Jenkins",
                    gc_contact_email="sjenkins@lfdriscoll.com",
                    source_platform="BuildingConnected",
                    gc_specific_due_date="2026-11-15",
                ),
                GCInvite(
                    gc_company_name="CT Corporation",
                    gc_contact_name="David Ross",
                    gc_contact_email="dross@ctcorp.com",
                    source_platform="PlanHub",
                    gc_specific_due_date="2026-11-16",
                ),
            ],
            documents=[
                ProjectDocument(
                    doc_category="SPECIFICATIONS",
                    file_name="01_Project_Manual_Div09.pdf",
                    storage_url="/docs/philly_charter_specs.pdf",
                    relevant_sheets=["Section 09 64 66 (p. 142)"],
                ),
                ProjectDocument(
                    doc_category="DRAWINGS",
                    file_name="Architectural_Set_A100_A110.pdf",
                    storage_url="/docs/philly_charter_drawings.pdf",
                    relevant_sheets=["A103", "A106"],
                ),
            ],
            activity_logs=[
                ActivityLog(
                    actor_name="AI Ingestion Agent",
                    actor_role="AI_WORKER",
                    action_type="MULTI_GC_MERGED",
                    comment_text="Merged 3 GC invites (Turner, LF Driscoll, CT Corp) into a single project dossier. Extracted CSI 09 64 66 & 4 manufacturers.",
                )
            ],
        )

        # Project 2: CT Corporation Site Operations Center (09 65 66 Resilient Only -> Ready for Addendum Demo!)
        p2 = Project(
            project_name="CT Corporation Site Operations & Church Renovation",
            project_address="450 Industrial Pkwy, Allentown, PA 18101",
            city="Allentown",
            state="PA",
            zip_code="18101",
            distance_miles=58.0,
            drive_time_hours=1.2,
            bid_due_date="2026-11-22",
            estimated_project_slot="Summer 2027",
            stage=ProjectStage.NEW_BID_INVITE,
            ai_recommendation=AIRecommendation.RECOMMEND_REJECT,
            ai_confidence_score=0.98,
            ai_reasoning_summary=(
                "REJECT RECOMMENDED: Division 09 contains ONLY Section 09 65 66 (Resilient Athletic Flooring / synthetic PVC). "
                "Addendum #1 only updates reflected ceiling and door hardware. No wood flooring scope currently exists."
            ),
            ai_risk_flags=[
                "Spec contains ONLY 09 65 66 Resilient Athletic Flooring (Synthetic).",
                "Addendum #1 reviewed: Reflected ceiling, PVC membrane & door hardware only.",
            ],
            detected_csi_codes=[
                CSICitation(
                    code="09 65 66",
                    title="Resilient Athletic Flooring (Synthetic)",
                    document_name="CT_Corp_Specs_Vol2.pdf",
                    page_number=88,
                    snippet="SECTION 09 65 66 - RESILIENT ATHLETIC FLOORING: Provide vulcanized composition rubber athletic sheet flooring...",
                    is_target_wood=False,
                )
            ],
            has_target_wood_code=False,
            has_resilient_code_only=True,
            work_type=WorkScopeType.RESILIENT_SYNTHETIC_ONLY,
            estimated_sq_ft=9200.0,
            architect_firm_name="Alloy5 Architecture",
            platform_tags=["PlanHub", "Direct Email"],
            gc_invites=[
                GCInvite(
                    gc_company_name="CT Corporation",
                    gc_contact_name="bid-desk@ctcorp.com",
                    source_platform="PlanHub",
                )
            ],
            documents=[
                ProjectDocument(
                    doc_category="SPECIFICATIONS",
                    file_name="CT_Corp_Specs_Vol2.pdf",
                    storage_url="/docs/ct_corp_specs.pdf",
                    relevant_sheets=["Section 09 65 66 (p. 88)"],
                ),
                ProjectDocument(
                    doc_category="ADDENDUM",
                    addendum_number=1,
                    file_name="Addendum_01_Ceiling_DoorHardware.pdf",
                    storage_url="/docs/addendum_01.pdf",
                    relevant_sheets=["Reflected Ceiling & Door Hardware"],
                ),
            ],
        )

        # Project 3: Small 200 sq ft Footprint / 4.2 Hour Drive (Demonstrates Karla's Distance vs Size Disqualifier)
        p3 = Project(
            project_name="Mountain View Municipal Annex Stage Repair",
            project_address="890 Route 6, Warren, PA 16365",
            city="Warren",
            state="PA",
            zip_code="16365",
            distance_miles=245.0,
            drive_time_hours=4.2,
            bid_due_date="2026-11-19",
            estimated_project_slot="Spring 2027",
            stage=ProjectStage.NEW_BID_INVITE,
            ai_recommendation=AIRecommendation.RECOMMEND_REJECT,
            ai_confidence_score=0.95,
            ai_reasoning_summary=(
                "REJECT RECOMMENDED: Although Section 09 64 00 Wood Flooring is specified, the total room "
                "footprint is only 200 sq ft and requires a 4.2-hour drive (245 miles). Travel and freight exceed project value."
            ),
            ai_risk_flags=[
                "Small footprint (200 sq ft) vs. 4.2-hour drive time (245 miles) fails minimum threshold."
            ],
            detected_csi_codes=[
                CSICitation(
                    code="09 64 00",
                    title="Wood Flooring (Small Stage Platform)",
                    document_name="Annex_Spec_Book.pdf",
                    page_number=34,
                    snippet="Repair and replace 200 sq ft oak platform flooring in Room 102...",
                    is_target_wood=True,
                )
            ],
            has_target_wood_code=True,
            work_type=WorkScopeType.SAND_AND_REFINISH,
            estimated_sq_ft=200.0,
            architect_firm_name="Local Borough Engineering",
            platform_tags=["Dodge"],
            gc_invites=[
                GCInvite(
                    gc_company_name="Keystone General Builders",
                    source_platform="Dodge",
                )
            ],
        )

        # Project 4: Pavilion Central School District (From SOP Page 11 - Stage 4 FOR PRICING, Estimate 3790)
        v1_pavilion = EstimateVersion(
            version_number=1,
            status="APPROVED_BY_KARLA",
            quickbooks_estimate_id="Estimate 3790",
            line_items=[
                EstimateLineItem(
                    category="Material",
                    description="Gymnasium MFMA Sealer, Polyurethane Finish & Game Line Paint",
                    quantity=10214.0,
                    unit="SF",
                    unit_cost=0.92,
                    margin_percent=28.0,
                ),
                EstimateLineItem(
                    category="Labor",
                    description="Drum Sanding, Edging, Screening & Game Line Painting Labor",
                    quantity=10214.0,
                    unit="SF",
                    unit_cost=2.10,
                    margin_percent=32.0,
                ),
                EstimateLineItem(
                    category="Equipment",
                    description="Dust Containment Sanding Equipment & Rider Buffer Mobilization",
                    quantity=1.0,
                    unit="LS",
                    unit_cost=1450.0,
                    margin_percent=20.0,
                ),
            ],
            exclusions_text="Excludes subfloor structural board replacement unless authorized via unit price alternate.",
            clarifications_text="Sanding and Refinishing Project with a Gymnasium approx. 10,214 sq ft. Write-up on QuickBooks Estimate 3790.",
            created_by="Karla Delaet",
        )
        EstimateRFQController.recalculate_estimate_totals(v1_pavilion)

        p4 = Project(
            project_name="Pavilion Central School District Gymnasium",
            project_address="7014 Big Tree Rd, Pavilion, NY 14525",
            city="Pavilion",
            state="NY",
            zip_code="14525",
            distance_miles=38.0,
            drive_time_hours=0.9,
            bid_due_date="2026-12-18",
            estimated_project_slot="Summer 2027",
            stage=ProjectStage.FOR_PRICING,
            ai_recommendation=AIRecommendation.RECOMMEND_BID,
            ai_confidence_score=0.99,
            ai_reasoning_summary="Approved by Karla. 10,214 sq ft Gymnasium Sanding & Refinishing project.",
            has_target_wood_code=True,
            work_type=WorkScopeType.SAND_AND_REFINISH,
            flooring_scope_tags=["Qualified", "Sand & Refinish", "Gymnasium"],
            estimated_sq_ft=10214.0,
            karla_decision="APPROVED",
            karla_decision_notes="Core gymnasium sand & refinish scope confirmed.",
            architect_firm_name="Kimmel Bogrette Architecture",
            specified_manufacturers=[
                SpecifiedManufacturer(
                    manufacturer_name="Robbins Sports Surfaces",
                    product_line="MFMA Heavy Duty Finish & Maple Replacement Strip",
                    is_basis_of_design=True,
                ),
                SpecifiedManufacturer(
                    manufacturer_name="Bona US",
                    product_line="Bona SuperCourt Athletic System",
                    is_basis_of_design=False,
                ),
            ],
            platform_tags=["Direct Email"],
            sales_tax_status="Tax Exempt",
            bid_type="Sealed Bid",
            labor_type="Prevailing Wage",
            clickup_task_id="CU-ATL-3790",
            clickup_task_url="https://app.clickup.com/t/86503790/pavilion-csd-gym",
            clickup_status="ESTIMATING_IN_PROGRESS",
            onedrive_project_folder_url="https://atlanticflooring-my.sharepoint.com/personal/karla_atlanticflooring_com/Documents/Estimating_2026/Pavilion_CSD_Gymnasium",
            onedrive_folder_status="PROVISIONED_AND_LINKED",
            project_drawings_link="https://onedrive.live.com/pavilion-drawings",
            takeoff_folder_link="https://onedrive.live.com/TAKE-OFF-and-EXTRACTED-DOCUMENTS-Pavilion",
            takeoff_summary_comment=(
                "Good Day Karla, Attached is the link of the take off for Pavilion Central School District. "
                "It is a Sanding and Refinishing Project with a Gymnasium approx. 10,214 sq ft. "
                "The write-up on QuickBooks for this project is found on Estimate 3790. Deadline is December 18."
            ),
            quickbooks_estimate_number="Estimate 3790",
            proposal_amount=v1_pavilion.final_proposal_amount,
            gc_invites=[
                GCInvite(
                    gc_company_name="pike Construction Services",
                    gc_contact_name="estimating@pike.com",
                    source_platform="Direct Email",
                )
            ],
            takeoff_items=[
                TakeoffItem(
                    room_or_area="Main High School Gymnasium",
                    flooring_type="Maple Sand & Refinish + Game Lines",
                    level_or_phase="Level 1 - Summer Recess",
                    sq_ft=10214.0,
                    transitions_lf=48.0,
                    base_lf=410.0,
                )
            ],
            vendor_rfq_quotes=[
                VendorRFQQuote(
                    manufacturer_or_dealer="Robbins Sports Surfaces",
                    contact_email="quotes@robbinsfloor.com",
                    product_system="Maple Strip & Finish Package",
                    quantity_sq_ft=10214.0,
                    delivery_window="Summer 2027",
                    architect_firm_name="Kimmel Bogrette Architecture",
                    rfq_status="QUOTE_RECEIVED",
                    quoted_unit_price=6.45,
                    quoted_freight=1650.0,
                    architect_price_alert="ARCHITECT LEVERAGE ALERT: Robbins is Basis-of-Design for Kimmel Bogrette Architecture (+ $0.85/SF premium detected).",
                ),
                VendorRFQQuote(
                    manufacturer_or_dealer="Connor Sports",
                    contact_email="quotes@connorsports.com",
                    product_system="Equivalent Maple & Finish Package",
                    quantity_sq_ft=10214.0,
                    delivery_window="Summer 2027",
                    architect_firm_name="Kimmel Bogrette Architecture",
                    rfq_status="QUOTE_RECEIVED",
                    quoted_unit_price=5.35,
                    quoted_freight=1200.0,
                ),
            ],
            estimate_versions=[v1_pavilion],
            activity_logs=[
                ActivityLog(
                    actor_name="Karla Delaet",
                    actor_role="SENIOR_ESTIMATOR",
                    action_type="STAGE_4_PRICING",
                    comment_text="Takeoff verified (10,214 sq ft). QuickBooks Estimate 3790 created and ready for vendor quote comparison.",
                )
            ],
        )

        await Project.insert_many([p1, p2, p3, p4])

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_initial_data()
    yield

app = FastAPI(
    title="Atlantic Autonomous Estimating & Bid Qualification OS",
    version="2.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth_router)
app.include_router(project_router)