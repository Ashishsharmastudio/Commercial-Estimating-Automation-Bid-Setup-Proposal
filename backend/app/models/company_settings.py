from typing import List
from datetime import datetime, timezone
from beanie import Document
from pydantic import Field

class CompanySettings(Document):
    company_name: str = "Atlantic Commercial Flooring"
    hq_address: str = "Center City, Philadelphia, PA"
    max_service_radius_miles: float = 40.0
    max_drive_time_hours: float = 3.0
    min_sq_ft_for_long_distance: float = 500.0
    target_csi_codes: List[str] = ["09 64 00", "09 64 66", "09 64 29"]
    excluded_csi_codes: List[str] = ["09 65 66", "09 65 00"]
    vip_prescreened_gcs: List[str] = ["Turner Construction", "LF Driscoll", "Gilbane"]
    default_exclusions_text: str = (
        "Excludes concrete slab moisture mitigation above 85% RH unless specified as alternate, "
        "dumpsters, hoisting, evening/weekend overtime labor, and wax/polish over synthetic surfaces."
    )
    default_clarifications_text: str = (
        "Proposal based on continuous single-phase access, HVAC operational 14 days prior to wood acclimating, "
        "and standard manufacturer warranty."
    )
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "company_settings"