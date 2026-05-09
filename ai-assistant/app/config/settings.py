import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    app_name: str = os.getenv("APP_NAME", "DonateHub AI Assistant")
    debug: bool = os.getenv("DEBUG", "True") == "True"
    port: int = int(os.getenv("PORT", 8000))
    host: str = os.getenv("HOST", "0.0.0.0")

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
