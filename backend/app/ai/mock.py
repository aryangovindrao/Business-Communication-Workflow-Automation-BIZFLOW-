import random

from app.ai.base import INTENTS, AiProvider

INTENT_KEYWORDS: dict[str, list[str]] = {
    "Sales Inquiry": ["pricing", "price", "plan", "enterprise", "seats", "quote", "upgrade", "demo", "trial", "buy", "purchase"],
    "Technical Support": ["error", "bug", "500", "not working", "broken", "issue", "webhook", "api", "fails", "crash", "help"],
    "Refund Request": ["refund", "charged twice", "duplicate charge", "money back", "reimburse"],
    "Billing Issue": ["invoice", "billing", "vat", "tax", "receipt", "charge", "payment"],
    "Meeting Request": ["demo", "meeting", "call", "schedule", "book", "calendar", "walkthrough"],
    "General Inquiry": ["question", "curious", "wondering", "discount", "nonprofit", "info"],
}

POSITIVE = ["love", "great", "thanks", "awesome", "promising", "excited", "happy", "perfect"]
NEGATIVE = ["error", "broken", "urgent", "frustrated", "angry", "fail", "charged twice", "not working", "disappointed"]


class MockProvider(AiProvider):
    """Deterministic-ish heuristic AI so the platform runs with no keys."""

    name = "mock"

    def classify_intent(self, text: str) -> dict:
        lower = text.lower()
        weights = []
        for label in INTENTS:
            hits = sum(1 for kw in INTENT_KEYWORDS[label] if kw in lower)
            weights.append((label, 0.4 + hits * 1.6 + random.random() * 0.2))
        total = sum(w for _, w in weights) or 1.0
        scores = sorted(
            ({"label": label, "score": w / total} for label, w in weights),
            key=lambda s: s["score"],
            reverse=True,
        )
        return {
            "intent": scores[0]["label"],
            "confidence": scores[0]["score"],
            "scores": scores,
        }

    def analyze_sentiment(self, text: str) -> dict:
        lower = text.lower()
        pos = sum(1 for w in POSITIVE if w in lower)
        neg = sum(1 for w in NEGATIVE if w in lower)
        if pos > neg:
            return {"sentiment": "Positive", "score": min(0.97, 0.6 + pos * 0.12)}
        if neg > pos:
            return {"sentiment": "Negative", "score": min(0.97, 0.6 + neg * 0.12)}
        return {"sentiment": "Neutral", "score": 0.5}

    def generate_reply(self, context: str, tone: str = "professional") -> str:
        openers = {
            "professional": "Thank you for reaching out.",
            "friendly": "Thanks so much for your message!",
            "concise": "Thanks for getting in touch.",
            "empathetic": "Thank you for flagging this — I completely understand, and I'm sorry for the trouble.",
        }
        snippet = " ".join(context.split())[:90]
        return (
            f"{openers.get(tone, openers['professional'])}\n\n"
            f'I\'ve reviewed your note regarding "{snippet}…" and I\'m happy to help. '
            "Here are the next steps, and I'll make sure everything is handled promptly.\n\n"
            "Please let me know if there's anything else I can clarify.\n\n"
            "Best regards,\nThe Acme Support Team"
        )

    def summarize(self, text: str) -> str:
        first = text.replace("\n", " ").split(".")[0].strip()
        return (
            f"Customer summary: {first}. Suggested priority based on tone and intent; "
            "a response is recommended within SLA."
        )
