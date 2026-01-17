from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache

class Settings(BaseSettings):
    # Aliases to match the user's .env file structure (UPPERCASE confirmed by debug)
    SUPABASE_KEY: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    GEMINI_API_KEY: str = Field(alias="GOOGLE_API_KEY")
    SUPABASE_PROJECT_ID: str = Field(alias="SUPABASE_PROJECT_ID")
    SUPABASE_JWT_SECRET: str = Field(alias="SUPABASE_JWT_SECRET")
    
    GEMINI_MODEL_NAME: str = "gemini-2.0-flash"
    
    COOKIDOO_COUNTRY: str = "de"
    COOKIDOO_LANGUAGE: str = "de"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def SUPABASE_URL(self) -> str:
        return f"https://{self.SUPABASE_PROJECT_ID}.supabase.co"

@lru_cache()
def get_settings():
    return Settings()
