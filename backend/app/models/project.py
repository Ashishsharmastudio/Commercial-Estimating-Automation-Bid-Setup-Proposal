from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from uuid import uuid4
from beanie import Document
from pydantic import BaseModel, Field
from app.config import settings

class ProjectStage(str, Enum):
    NEW_BID_INVITE = "NEW_BID_INVITE"               # Stage 1
    QUALIFIED = "QUALIFIED"                         # Stage 2
    IN_TAKEOFF = "IN_TAKEOFF"                       # Stage 3
    FOR_PRICING = "FOR_PRICING"                     # Stage 4
    ESTIMATE_SENT = "ESTIMATE_SENT"                 # Stage 5
    CLOSING_NEGOTIATION = "CLOSING_NEGOTIATION"     # Stage 6
    WON_AWARDED = "WON_AWARDED"                     # Stage 7
    NO_BID_REJECTED = "NO_BID_REJECTED"             # Rejected / Lost (still watched for Addenda)

class AIRecommendation(str, Enum):
    PENDING_ANALYSIS = "PENDING_ANALYSIS"
    RECOMMEND_BID = "RECOMMEND_BID"
    RECOMMEND_REJECT = "RECOMMEND_REJECT"
    NEEDS_MANUAL_REVIEW = "NEEDS_MANUAL_REVIEW"

class WorkScopeType(str, Enum):
    NEW_INSTALLATION = "NEW_INSTALLATION"
    SAND_AND_REFINISH = "SAND_AND_REFINISH"
    HYBRID_BOTH = "HYBRID_BOTH"
    RESILIENT_SYNTHETIC_ONLY = "RESILIENT_SYNTHETIC_ONLY"
    UNKNOWN_OR_NONE = "UNKNOWN_OR_NONE"

class WinProbabilityTier(str, Enum):
    HIGH_PRIORITY_TARGET = "HIGH_PRIORITY_TARGET"
    STANDARD_COMPETITIVE = "STANDARD_COMPETITIVE"
    LOW_PROB_COURTESY_BID = "LOW_PROB_COURTESY_BID"

class GCInvite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    gc_company_name: str
    gc_contact_name: Optional[str] = None
    gc_contact_email: Optional[str] = None
    source_platform: str = "Direct Email"  # Email, PlanHub, Dodge, ConstructConnect, BuildingConnected, Procore
    portal_project_url: Optional[str] = None
    gc_specific_due_date: Optional[str] = None
    received_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CSICitation(BaseModel):
    code: str                              # e.g., "09 64 66" or "09 65 66"
    title: str                             # e.g., "Wood Athletic Flooring"
    document_name: str
    page_number: int
    snippet: str
    is_target_wood: bool = True

class SpecifiedManufacturer(BaseModel):
    manufacturer_name: str                 # e.g., "Robbins Sports Surfaces", "Connor Sports", "Aacer"
    product_line: str
    csi_section: str = "09 64 66"
    is_basis_of_design: bool = False
    or_equal_allowed: bool = True

class ProjectDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    doc_category: str                      # SPECIFICATIONS, DRAWINGS, ADDENDUM, BID_INSTRUCTIONS, TAKEOFF_FILE, VENDOR_QUOTE, AWARD_DOCUMENT, ACCEPTED_PROPOSAL
    addendum_number: Optional[int] = None
    file_name: str
    storage_url: str
    relevant_sheets: List[str] = []        # e.g., ["A103", "A106", "Finish Schedule"]
    uploaded_by: str = "AI_WORKER"
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TakeoffItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    room_or_area: str                      # e.g., "Main Gymnasium"
    flooring_type: str                     # e.g., "25/32 Maple Strip Flooring" or "Sand & Refinish"
    level_or_phase: str = "Level 1 - Phase 1"
    sq_ft: float
    transitions_lf: float = 0.0
    base_lf: float = 0.0
    moisture_mitigation_required: bool = False
    floor_prep_notes: Optional[str] = None
    demo_required: bool = False

class VendorRFQQuote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    manufacturer_or_dealer: str
    contact_email: str
    product_system: str
    quantity_sq_ft: float
    delivery_window: str                   # e.g., "Summer 2027"
    architect_firm_name: Optional[str] = None
    rfq_status: str = "DRAFT"              # DRAFT, SENT, QUOTE_RECEIVED, APPLIED_TO_ESTIMATE
    quoted_unit_price: Optional[float] = None
    quoted_freight: float = 0.0
    lead_time_notes: Optional[str] = None
    architect_price_alert: Optional[str] = None
    sent_at: Optional[datetime] = None

class EstimateLineItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    category: str                          # Material, Labor, Equipment, Prep_Demo, Freight, Alternate, Allowance
    description: str
    quantity: float
    unit: str = "SF"                       # SF, LF, LS
    unit_cost: float
    margin_percent: float = 25.0
    total_cost: float = 0.0
    total_price: float = 0.0

class EstimateVersion(BaseModel):
    version_number: int = 1
    status: str = "DRAFT_TAKEOFF"          # DRAFT_TAKEOFF, READY_FOR_KARLA, APPROVED_BY_KARLA, SENT_TO_GC, REVISED_VE
    is_courtesy_rom: bool = False
    quickbooks_estimate_id: Optional[str] = None
    quickbooks_synced_at: Optional[datetime] = None
    line_items: List[EstimateLineItem] = []
    subtotal_cost: float = 0.0
    overhead_and_margin_total: float = 0.0
    freight_total: float = 0.0
    final_proposal_amount: float = 0.0
    exclusions_text: str = ""
    clarifications_text: str = ""
    created_by: str = "System"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    actor_name: str
    actor_role: str
    action_type: str
    comment_text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Project(Document):
    # Stage 1 Core Identification & Location
    project_name: str
    project_address: str
    city: str = ""
    state: str = "PA"
    zip_code: str = ""
    distance_miles: float = 0.0
    drive_time_hours: float = 0.0
    bid_due_date: str
    estimated_project_slot: str = "Summer 2027"
    stage: ProjectStage = ProjectStage.NEW_BID_INVITE

    # AI Qualification & Karla HITL Gatekeeping
    ai_recommendation: AIRecommendation = AIRecommendation.PENDING_ANALYSIS
    ai_confidence_score: float = 0.0
    ai_reasoning_summary: str = ""
    ai_model_name: str = Field(default_factory=lambda: settings.AI_MODEL_NAME)
    ai_risk_flags: List[str] = []
    detected_csi_codes: List[CSICitation] = []
    has_target_wood_code: bool = False
    has_resilient_code_only: bool = False
    work_type: WorkScopeType = WorkScopeType.UNKNOWN_OR_NONE
    flooring_scope_tags: List[str] = []
    estimated_sq_ft: float = 0.0
    karla_decision: Optional[str] = None   # APPROVED, REJECTED, or None
    karla_decision_notes: Optional[str] = None
    karla_reviewed_at: Optional[datetime] = None
    rejection_chip: Optional[str] = None   # "Out of Territory", "Non-Wood Scope", "Summer Fully Booked", "Poor GC Terms"
    assigned_estimator: Optional[str] = "Karla Delaet"
    has_unread_addendum: bool = False
    latest_addendum_summary: Optional[str] = None

    # Stage 1 Data Gatekeeper & Distance-vs-Footprint Fields
    has_missing_vital_facts: bool = False
    missing_vital_fields: List[str] = []
    distance_check_badge: str = ""
    distance_check_status: str = "QUALIFIED"  # QUALIFIED, HIGH_OVERHEAD, OUT_OF_TERRITORY
    distance_check_notes: str = ""
    onedrive_subfolders: List[str] = []

    # Architect, Manufacturers & Courtesy Bid Tiering (Phase 2.5 Upgrade)
    architect_firm_name: Optional[str] = None
    specified_manufacturers: List[SpecifiedManufacturer] = []
    finish_schedule_extracted: List[Dict[str, Any]] = []
    win_probability_tier: WinProbabilityTier = WinProbabilityTier.STANDARD_COMPETITIVE
    is_prescreened_gc_invite: bool = False

    # Stage 1 SOP Compliance & Commercial Custom Fields
    platform_tags: List[str] = []          # PlanHub, Direct Email, Dodge, BuildingConnected, etc.
    sales_tax_status: str = "Tax Exempt"   # Tax Exempt / Capital Improvement / Full Sales Tax
    bid_type: str = "Open Bid"             # Sealed Bid / Open Bid
    pla_status: str = "No"                 # Yes / No / na
    buy_america_status: str = "No"         # Yes / No / na
    bond_required: str = "No"              # Yes / No
    insurance_required: str = "Yes"        # Yes / No
    labor_type: str = "Prevailing Wage"    # Open Shop, Non Union / Union / Prevailing Wage
    competing_flooring_bidders: List[str] = []

    # Stage 1 Box 3: Automated ClickUp Task & OneDrive Project Folder Provisioning (Workflow Box 3)
    clickup_task_id: Optional[str] = None
    clickup_task_url: Optional[str] = None
    clickup_status: Optional[str] = None       # "BID_TASK_CREATED", "ESTIMATING_IN_PROGRESS"
    clickup_synced_at: Optional[datetime] = None
    onedrive_project_folder_url: Optional[str] = None
    onedrive_folder_status: Optional[str] = None  # "FOLDER_PROVISIONED", "FILES_LINKED"
    onedrive_provisioned_at: Optional[datetime] = None

    # Stage 3 & 4 Links, Takeoff & QuickBooks Fields
    project_drawings_link: str = ""
    takeoff_folder_link: str = ""          # OneDrive (TAKE-OFF and EXTRACTED DOCUMENTS)
    takeoff_summary_comment: str = ""
    quickbooks_estimate_number: str = ""   # e.g., "Estimate 3790"
    proposal_amount: float = 0.0

    # Stage 5, 6 & 7 Follow-up, Negotiation & Award Fields
    next_followup_date: Optional[str] = None
    awarded_gc_name: str = ""
    bid_standing_notes: str = ""           # e.g., "Apparent low bidder" or "2nd low"
    contract_value: float = 0.0
    project_start_date: str = ""
    award_proof_type: str = ""             # LOI, NTP, SIGNED_CONTRACT, PO, AWARD_EMAIL
    pm_handoff_confirmed: bool = False

    # Embedded Collections (1-Read Document Architecture)
    gc_invites: List[GCInvite] = []
    documents: List[ProjectDocument] = []
    takeoff_items: List[TakeoffItem] = []
    vendor_rfq_quotes: List[VendorRFQQuote] = []
    estimate_versions: List[EstimateVersion] = []
    activity_logs: List[ActivityLog] = []

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projects"

class UploadedSpecDocument(Document):
    filename: str
    file_size_bytes: int = 0
    storage_url: str
    uploaded_by: str = "Karla Delaet"
    extracted_intelligence: Dict[str, Any] = {}
    ai_confirmation: str = ""
    ai_summary: str = ""
    ai_model_name: str = Field(default_factory=lambda: settings.AI_MODEL_NAME)
    ai_recommendation: str = "PENDING_ANALYSIS"
    detected_csi_codes: List[CSICitation] = []
    specified_manufacturers: List[SpecifiedManufacturer] = []
    estimated_sq_ft: float = 0.0
    work_type: str = "UNKNOWN_OR_NONE"
    binary_base64: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "uploaded_spec_documents"