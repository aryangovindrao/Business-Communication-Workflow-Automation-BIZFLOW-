import json

import requests

from app.ai.base import INTENTS, AiProvider
from app.core.config import settings


class OllamaProvider(AiProvider):
    """Local Ollama provider (offline, no keys). Default model: llama3."""

    name = "ollama"

    def _generate(self, prompt: str, as_json: bool = False) -> str:
        payload = {"model": settings.ollama_model, "prompt": prompt, "stream": False}
        if as_json:
            payload["format"] = "json"
        resp = requests.post(
            f"{settings.ollama_base_url}/api/generate", json=payload, timeout=120
        )
        resp.raise_for_status()
        return resp.json().get("response", "")

    def classify_intent(self, text: str) -> dict:
        raw = self._generate(
            f"Classify this customer message into exactly one of: {', '.join(INTENTS)}. "
            f'Respond as JSON {{"intent": string, "confidence": number}}. Message: """{text}"""',
            as_json=True,
        )
        intent, confidence = "General Inquiry", 0.7
        try:
            parsed = json.loads(raw)
            if parsed.get("intent") in INTENTS:
                intent = parsed["intent"]
            confidence = float(parsed.get("confidence", confidence))
        except (json.JSONDecodeError, ValueError, TypeError):
            pass
        other = (1 - confidence) / (len(INTENTS) - 1)
        scores = [
            {"label": label, "score": confidence if label == intent else other}
            for label in INTENTS
        ]
        return {"intent": intent, "confidence": confidence, "scores": scores}

    def analyze_sentiment(self, text: str) -> dict:
        raw = self._generate(
            "Classify the sentiment as Positive, Neutral, or Negative. "
            f'Respond as JSON {{"sentiment": string, "score": number}}. Message: """{text}"""',
            as_json=True,
        )
        sentiment, score = "Neutral", 0.6
        try:
            parsed = json.loads(raw)
            if parsed.get("sentiment") in ("Positive", "Neutral", "Negative"):
                sentiment = parsed["sentiment"]
            score = float(parsed.get("score", score))
        except (json.JSONDecodeError, ValueError, TypeError):
            pass
        return {"sentiment": sentiment, "score": score}

    def generate_reply(self, context: str, tone: str = "professional") -> str:
        return self._generate(
            f"Write a {tone} business reply to this customer message. "
            f'Be helpful and concise. Message: """{context}"""'
        )

    def summarize(self, text: str) -> str:
        return self._generate(f'Summarize this conversation in 1-2 sentences: """{text}"""')
