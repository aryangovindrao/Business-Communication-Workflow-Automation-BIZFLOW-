from functools import lru_cache

from app.ai.base import AiProvider
from app.ai.mock import MockProvider
from app.core.config import settings


@lru_cache
def get_ai_provider() -> AiProvider:
    """Resolve the configured AI provider; falls back to mock."""
    provider = settings.ai_provider.lower()
    if provider == "huggingface":
        from app.ai.huggingface import HuggingFaceProvider

        return HuggingFaceProvider()
    if provider == "ollama":
        from app.ai.ollama import OllamaProvider

        return OllamaProvider()
    return MockProvider()


# Convenience singleton for non-DI callers (workflow engine, seed).
ai = get_ai_provider()
