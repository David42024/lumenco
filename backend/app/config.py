"""
Configuración centralizada del backend. Lee variables desde .env
usando Pydantic Settings.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = ""
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 horas
    frontend_url: str = "http://localhost:5173"
    
    # Promption
    filter_api_url: str = "https://promption.onrender.com"
    promption_api_key: str = ""
    tenant_id: str = ""
    
    # Gemini
    gemini_api_key: str = ""
    model_config = {
        "env_file": [".env", "backend/.env"],
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()

