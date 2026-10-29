from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # MongoDB Atlas Cloud URI (Strictly loaded from .env)
    MONGODB_URI: str = ""
    DATABASE_NAME: str = "atlantic_estimating_os"
    JWT_SECRET: str = "super-secret-atlantic-estimating-key-2026"
    
    # AI Engine Model Selection (Configurable from .env)
    AI_PROVIDER: str = "gemini"                      # "gemini" or "openai"
    AI_MODEL_NAME: str = "gemini-1.5-flash"          # e.g. "gemini-1.5-flash", "gemini-2.0-flash", "gpt-4o", "gpt-4o-mini"
    
    # AI Engine Keys
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # QuickBooks Online
    QBO_REALM_ID: str = "9130357992"
    QBO_ENVIRONMENT: str = "sandbox"
    
    # Option A: Microsoft Graph API (Office 365 OAuth2) - Primary Dedicated Ingestion
    AZURE_TENANT_ID: str = ""
    AZURE_CLIENT_ID: str = ""
    AZURE_CLIENT_SECRET: str = ""
    OUTLOOK_MONITORED_EMAIL: str = "karla@atlanticflooring.com"
    OUTLOOK_FOLDER_NAME: str = "Inbox/Bid Invites"
    
    # Option B: Universal IMAP4 over SSL - Direct Mailbox Fallback
    IMAP_HOST: str = "outlook.office365.com"
    IMAP_PORT: int = 993
    IMAP_USER: str = ""
    IMAP_PASSWORD: str = ""
    IMAP_FOLDER: str = "INBOX/Bid Invites"

    class Config:
        env_file = (".env", "../.env")
        extra = "ignore"

settings = Settings()