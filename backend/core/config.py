"""Configuration settings for Agent Sentinel runtime security engine."""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Agent Sentinel"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    API_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./sentinel.db"
    
    # Risk Scoring Thresholds
    RISK_THRESHOLD_REVIEW: int = 40
    RISK_THRESHOLD_BLOCK: int = 75
    
    # DLP & Anomaly Defaults
    MAX_ROWS_ALERT_THRESHOLD: int = 1000
    EXFIL_DOMAINS_BLOCKLIST: list[str] = [
        "pastebin.com", "webhook.site", "transfer.sh", "tempmail.org",
        "simulated-external-destination.io", "external-cloud-leak.net"
    ]
    
    # AI Investigator Configuration
    LLM_PROVIDER: str = "local"  # "local", "openai", "anthropic", "ollama"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Storage and Redaction
    REDACT_PII_IN_EVIDENCE: bool = True
    MAX_CHAIN_DEPTH_DEFAULT: int = 15
    MAX_TOOL_CALLS_DEFAULT: int = 30

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
