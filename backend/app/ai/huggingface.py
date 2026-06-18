import requests

from app.ai.base import INTENTS, AiProvider
from app.core.config import settings

HF_BASE = "https://api-inference.huggingface.co/models"


class HuggingFaceProvider(AiProvider):
    """Hugging Face Inference API (free tier). Zero-shot intent + sentiment + BART summary."""

    name = "huggingface"

    def _headers(self) -> dict:
        h = {"Content-Type": "application/json"}
        if settings.hf_token:
            h["Authorization"] = f"Bearer {settings.hf_token}"
        return h

    def _post(self, model: str, payload: dict) -> object:
        resp = requests.post(
            f"{HF_BASE}/{model}", json=payload, headers=self._headers(), timeout=30
        )
        resp.raise_for_status()
        return resp.json()

    def classify_intent(self, text: str) -> dict:
        out = self._post(
            settings.hf_model_intent,
            {"inputs": text, "parameters": {"candidate_labels": INTENTS}},
        )
        scores = [
            {"label": label, "score": score}
            for label, score in zip(out["labels"], out["scores"])
        ]
        return {"intent": scores[0]["label"], "confidence": scores[0]["score"], "scores": scores}

    def analyze_sentiment(self, text: str) -> dict:
        out = self._post(settings.hf_model_sentiment, {"inputs": text})
        top = out[0][0] if isinstance(out[0], list) else out[0]
        label = str(top.get("label", "NEUTRAL")).upper()
        sentiment = "Positive" if label == "POSITIVE" else "Negative" if label == "NEGATIVE" else "Neutral"
        return {"sentiment": sentiment, "score": top.get("score", 0.5)}

    def generate_reply(self, context: str, tone: str = "professional") -> str:
        summary = self.summarize(context)
        return f"Thank you for reaching out. {summary}\n\n(Generated via Hugging Face, tone: {tone}.)"

    def summarize(self, text: str) -> str:
        out = self._post(settings.hf_model_summary, {"inputs": text})
        return out[0].get("summary_text", text[:160])
