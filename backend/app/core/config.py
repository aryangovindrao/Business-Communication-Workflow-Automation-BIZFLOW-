from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULT_SECRET = "dev-insecure-change-me-please-32chars-min"


class Settings(BaseSettings):
    """Application settings loaded from environment / .env."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    app_name: str = "BizFlow API"
    env: str = "development"
    debug: bool = True

    # Auth
    secret_key: str = _INSECURE_DEFAULT_SECRET
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Database
    database_url: str = "sqlite:///./bizflow.db"
    # Off by default — the first account is created via sign-up. Set true to
    # load optional sample data for evaluation/dev.
    seed_on_startup: bool = False

    # CORS (comma-separated)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # AI provider
    ai_provider: str = "mock"
    hf_token: str = ""
    hf_model_intent: str = "facebook/bart-large-mnli"
    hf_model_sentiment: str = "distilbert-base-uncased-finetuned-sst-2-english"
    hf_model_summary: str = "facebook/bart-large-cnn"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # Integrations
    slack_webhook_url: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "BizFlow <no-reply@bizflow.local>"

    # Background jobs
    redis_url: str = "redis://localhost:6379/0"

    @model_validator(mode="after")
    def _enforce_production_secret(self) -> "Settings":
        if self.env.lower() in ("production", "prod") and (
            self.secret_key == _INSECURE_DEFAULT_SECRET or len(self.secret_key) < 32
        ):
            raise ValueError(
                "SECRET_KEY must be set to a strong value (>=32 chars) in production"
            )
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
