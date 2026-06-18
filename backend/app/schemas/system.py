from datetime import datetime

from app.schemas.base import CamelModel


class NotificationOut(CamelModel):
    id: str
    type: str
    title: str
    body: str
    read: bool
    channel: str
    created_at: datetime


# ── Analytics ────────────────────────────────────────────────
class KpiSummary(CamelModel):
    total_messages: int
    total_messages_delta: float
    open_tickets: int
    open_tickets_delta: float
    avg_response_minutes: int
    avg_response_delta: float
    lead_conversion_rate: float
    lead_conversion_delta: float
    workflow_success_rate: float
    workflow_success_delta: float
    csat: float
    csat_delta: float


class TimeSeriesPoint(CamelModel):
    date: str
    messages: int
    resolved: int
    response_minutes: int


class DistributionPoint(CamelModel):
    name: str
    value: float


class FunnelPoint(CamelModel):
    stage: str
    value: float


class CsatPoint(CamelModel):
    date: str
    csat: float


class WorkflowTrendPoint(CamelModel):
    date: str
    success: int
    failed: int


class AnalyticsData(CamelModel):
    kpis: KpiSummary
    messages_over_time: list[TimeSeriesPoint]
    intent_distribution: list[DistributionPoint]
    sentiment_distribution: list[DistributionPoint]
    channel_distribution: list[DistributionPoint]
    conversion_funnel: list[FunnelPoint]
    csat_trend: list[CsatPoint]
    workflow_success_trend: list[WorkflowTrendPoint]


# ── AI ───────────────────────────────────────────────────────
class AiTextRequest(CamelModel):
    text: str


class AiReplyRequest(CamelModel):
    text: str
    tone: str | None = "professional"


class IntentScore(CamelModel):
    label: str
    score: float


class IntentResult(CamelModel):
    intent: str
    confidence: float
    scores: list[IntentScore]


class SentimentResult(CamelModel):
    sentiment: str
    score: float


class TextResult(CamelModel):
    result: str
