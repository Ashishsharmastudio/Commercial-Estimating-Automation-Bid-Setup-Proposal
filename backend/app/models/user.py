from enum import Enum
from datetime import datetime, timezone
from beanie import Document
from pydantic import Field

class UserRole(str, Enum):
    OWNER = "OWNER"                         # John: Full executive, negotiation & award authority
    SENIOR_ESTIMATOR = "SENIOR_ESTIMATOR"   # Karla: Sole Triage Approve/Reject & Stage 4/6 Pricing authority
    ESTIMATOR = "ESTIMATOR"                 # Takeoff / Sales Follow-up (Cannot approve triage or finalize pricing)
    AI_WORKER = "AI_WORKER"                 # Automated ingestion & PDF parsing bot

class User(Document):
    full_name: str
    email: str
    role: UserRole
    title: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"