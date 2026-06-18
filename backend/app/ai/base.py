from abc import ABC, abstractmethod

INTENTS: list[str] = [
    "Sales Inquiry",
    "Technical Support",
    "Refund Request",
    "Billing Issue",
    "Meeting Request",
    "General Inquiry",
]

SENTIMENTS = ["Positive", "Neutral", "Negative"]


class AiProvider(ABC):
    """Provider-agnostic AI contract (mock | huggingface | ollama)."""

    name: str = "base"

    @abstractmethod
    def classify_intent(self, text: str) -> dict:
        """-> {'intent', 'confidence', 'scores': [{'label','score'}]}"""

    @abstractmethod
    def analyze_sentiment(self, text: str) -> dict:
        """-> {'sentiment', 'score'}"""

    @abstractmethod
    def generate_reply(self, context: str, tone: str = "professional") -> str: ...

    @abstractmethod
    def summarize(self, text: str) -> str: ...
