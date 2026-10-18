from typing import Optional
from datetime import datetime, timezone
from beanie import Document
from pydantic import Field

class AIFeedbackRule(Document):
    source_project_id: Optional[str] = None
    source_project_name: Optional[str] = None
    rule_category: str = "SCOPE_AND_LOGISTICS"  # CSI_CODE, DISTANCE_VS_SIZE, MATERIAL_EXCLUSION, GC_RULE
    natural_language_rule: str
    created_by: str = "Karla Delaet"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "ai_feedback_rules"