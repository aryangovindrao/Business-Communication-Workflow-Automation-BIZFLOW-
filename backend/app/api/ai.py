from fastapi import APIRouter

from app.ai import get_ai_provider
from app.core.deps import CurrentUser
from app.schemas.system import (
    AiReplyRequest,
    AiTextRequest,
    IntentResult,
    SentimentResult,
    TextResult,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/classify-intent", response_model=IntentResult)
def classify_intent(payload: AiTextRequest, _: CurrentUser):
    return get_ai_provider().classify_intent(payload.text)


@router.post("/sentiment", response_model=SentimentResult)
def sentiment(payload: AiTextRequest, _: CurrentUser):
    return get_ai_provider().analyze_sentiment(payload.text)


@router.post("/summarize", response_model=TextResult)
def summarize(payload: AiTextRequest, _: CurrentUser):
    return TextResult(result=get_ai_provider().summarize(payload.text))


@router.post("/reply", response_model=TextResult)
def reply(payload: AiReplyRequest, _: CurrentUser):
    return TextResult(
        result=get_ai_provider().generate_reply(payload.text, payload.tone or "professional")
    )
