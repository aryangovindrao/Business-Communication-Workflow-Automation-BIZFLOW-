"""
Analytics computed entirely from a tenant's real rows — no synthetic padding.
A brand-new organization therefore reads ~zero across the board.

CSAT is derived from message sentiment as a transparent proxy (until an
explicit customer-satisfaction survey feature exists).
"""
from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.base import INTENTS
from app.models import Contact, Message, WorkflowRun
from app.schemas.system import (
    AnalyticsData,
    CsatPoint,
    DistributionPoint,
    FunnelPoint,
    KpiSummary,
    TimeSeriesPoint,
    WorkflowTrendPoint,
)

SENTIMENTS = ["Positive", "Neutral", "Negative"]
CHANNEL_LABELS = {"email": "Email", "contact_form": "Contact Form", "chat": "Chat"}
FUNNEL_STAGES = [
    ("new", "New"),
    ("contacted", "Contacted"),
    ("qualified", "Qualified"),
    ("proposal", "Proposal"),
    ("won", "Won"),
]


def _as_date(dt: datetime):
    return dt.date()


def _parse_iso(value) -> datetime | None:
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def _pct_delta(current: float, previous: float) -> float:
    return round((current - previous) / previous, 3) if previous > 0 else 0.0


def _csat(pos: int, neu: int, total: int) -> float:
    """Sentiment-derived satisfaction proxy on a 0..5 scale."""
    return round(5 * (pos + 0.5 * neu) / total, 1) if total else 0.0


def build_analytics(db: Session, organization_id: str) -> AnalyticsData:
    msgs = db.scalars(
        select(Message).where(Message.organization_id == organization_id)
    ).all()
    contacts = db.scalars(
        select(Contact).where(Contact.organization_id == organization_id)
    ).all()
    runs = db.scalars(
        select(WorkflowRun).where(WorkflowRun.organization_id == organization_id)
    ).all()

    total_messages = len(msgs)
    open_tickets = sum(1 for m in msgs if m.status in ("open", "pending"))

    # ── 14-day buckets ───────────────────────────────────────
    today = datetime.now(timezone.utc).date()
    days = [today - timedelta(days=i) for i in range(13, -1, -1)]
    received: Counter = Counter()
    resolved: Counter = Counter()
    day_pos: Counter = Counter()
    day_neu: Counter = Counter()
    resp_by_day: dict = {}

    for m in msgs:
        d = _as_date(m.created_at)
        received[d] += 1
        if m.status in ("resolved", "closed"):
            resolved[d] += 1
        if m.sentiment == "Positive":
            day_pos[d] += 1
        elif m.sentiment == "Neutral":
            day_neu[d] += 1
        # Response time = first customer → first agent reply within the thread.
        thread = m.thread or []
        cust = next((t for t in thread if t.get("authorRole") == "customer"), None)
        agent = next((t for t in thread if t.get("authorRole") == "agent"), None)
        if cust and agent:
            c, a = _parse_iso(cust.get("createdAt")), _parse_iso(agent.get("createdAt"))
            if c and a and a >= c:
                resp_by_day.setdefault(d, []).append((a - c).total_seconds() / 60)

    def day_resp(d) -> int:
        vals = resp_by_day.get(d, [])
        return round(sum(vals) / len(vals)) if vals else 0

    series = [
        TimeSeriesPoint(
            date=d.strftime("%b %d"),
            messages=received.get(d, 0),
            resolved=resolved.get(d, 0),
            response_minutes=day_resp(d),
        )
        for d in days
    ]

    all_resp = [v for vals in resp_by_day.values() for v in vals]
    avg_response = round(sum(all_resp) / len(all_resp)) if all_resp else 0

    last7 = sum(received.get(today - timedelta(days=i), 0) for i in range(0, 7))
    prev7 = sum(received.get(today - timedelta(days=i), 0) for i in range(7, 14))

    # ── Distributions ────────────────────────────────────────
    intent_counts = Counter(m.intent for m in msgs)
    sentiment_counts = Counter(m.sentiment for m in msgs)
    channel_counts = Counter(m.channel for m in msgs)

    # ── CRM funnel + conversion ──────────────────────────────
    status_counts = Counter(c.status for c in contacts)
    won = status_counts.get("won", 0)
    decided = won + status_counts.get("lost", 0)
    lead_conversion = round(won / decided, 3) if decided else 0.0

    # ── Workflow runs ────────────────────────────────────────
    total_runs = len(runs)
    success = sum(1 for r in runs if r.status == "success")
    wf_success_rate = round(success / total_runs, 3) if total_runs else 0.0
    wf_success_day: Counter = Counter()
    wf_failed_day: Counter = Counter()
    for r in runs:
        d = _as_date(r.started_at)
        if r.status == "success":
            wf_success_day[d] += 1
        elif r.status == "failed":
            wf_failed_day[d] += 1

    pos_total = sentiment_counts.get("Positive", 0)
    neu_total = sentiment_counts.get("Neutral", 0)

    return AnalyticsData(
        kpis=KpiSummary(
            total_messages=total_messages,
            total_messages_delta=_pct_delta(last7, prev7),
            open_tickets=open_tickets,
            open_tickets_delta=0.0,
            avg_response_minutes=avg_response,
            avg_response_delta=0.0,
            lead_conversion_rate=lead_conversion,
            lead_conversion_delta=0.0,
            workflow_success_rate=wf_success_rate,
            workflow_success_delta=0.0,
            csat=_csat(pos_total, neu_total, total_messages),
            csat_delta=0.0,
        ),
        messages_over_time=series,
        intent_distribution=[
            DistributionPoint(name=i, value=intent_counts.get(i, 0)) for i in INTENTS
        ],
        sentiment_distribution=[
            DistributionPoint(name=s, value=sentiment_counts.get(s, 0))
            for s in SENTIMENTS
        ],
        channel_distribution=[
            DistributionPoint(name=label, value=channel_counts.get(key, 0))
            for key, label in CHANNEL_LABELS.items()
        ],
        conversion_funnel=[
            FunnelPoint(stage=label, value=status_counts.get(key, 0))
            for key, label in FUNNEL_STAGES
        ],
        csat_trend=[
            CsatPoint(
                date=d.strftime("%b %d"),
                csat=_csat(day_pos.get(d, 0), day_neu.get(d, 0), received.get(d, 0)),
            )
            for d in days
        ],
        workflow_success_trend=[
            WorkflowTrendPoint(
                date=d.strftime("%b %d"),
                success=wf_success_day.get(d, 0),
                failed=wf_failed_day.get(d, 0),
            )
            for d in days
        ],
    )
