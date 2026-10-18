from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.user import User
from app.models.company_settings import CompanySettings
from app.models.ai_feedback import AIFeedbackRule
from app.models.project import Project, UploadedSpecDocument

async def init_db():
    if not settings.MONGODB_URI:
        raise ValueError(
            "CRITICAL: MONGODB_URI is not set! Please define MONGODB_URI in your .env file."
        )
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    
    # Extract database name from settings or fallback
    db_name = getattr(settings, "DATABASE_NAME", "atlantic_estimating_os")
    db = client[db_name]

    await init_beanie(
        database=db,
        document_models=[
            User,
            CompanySettings,
            AIFeedbackRule,
            Project,
            UploadedSpecDocument,
        ],
    )