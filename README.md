# BizFlow — AI-Powered Business Communication Workflow Automation Platform

A multi-tenant SaaS that ingests customer emails, contact-form submissions, and
chat messages, **classifies them with AI** (intent + sentiment), runs
**workflow automations**, drafts replies, routes work to the right team, updates
the **CRM**, and surfaces **analytics** — in the spirit of Zapier × HubSpot ×
Zendesk, focused on AI-powered business communication.

```
┌──────────────┐      REST /api      ┌───────────────────┐
│ React 19 SPA │ ──────────────────▶ │  FastAPI backend  │
│ (frontend/)  │ ◀────────────────── │   (backend/)      │
└──────────────┘                     └─────────┬─────────┘
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                    Workflow Engine        AI Layer            CRM / Analytics
                          │             (mock/HF/Ollama)            │
                          └────────────────────┼────────────────────┘
                                     PostgreSQL + pgvector
                                     Redis → Celery (+ Beat)
                                Gmail SMTP · Slack webhooks
```

## Repository layout

| Path          | What                                                                 |
| ------------- | ------------------------------------------------------------------- |
| `frontend/`   | React 19 + TS + Vite SPA. 8 pages, React Flow workflow builder, Recharts. |
| `backend/`    | FastAPI + SQLAlchemy. Auth/RBAC, AI layer, workflow engine, Celery.  |
| `docker-compose.yml` | Full stack: frontend, backend, postgres(+pgvector), redis, celery worker + beat. |

## Run it

**Option A — local dev (no Docker).** Two terminals:

```bash
# 1) backend  (SQLite; no demo data — create your account via sign-up)
cd backend && python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# 2) frontend  (talks to the backend by default)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173, click **Create one**, and register your workspace —
the first user becomes its Admin. For offline UI work without a backend, set
`VITE_MOCK_MODE=true`; to preview with sample data, start the backend with
`SEED_ON_STARTUP=true`.

**Option B — full stack with Docker:**

```bash
docker compose up --build      # frontend on :80, API on :8000
```

## Highlights

- **Auth & RBAC** — JWT access + refresh, four roles (Admin/Manager/Agent/Viewer),
  enforced on both client and server.
- **Multi-tenancy** — every table carries `organization_id`; every query is scoped.
- **AI, provider-agnostic** — mock (offline) by default; Hugging Face or Ollama by config.
- **Workflow engine** — drag-and-drop builder (React Flow) → real trigger/condition/action execution with run history.
- **CRM + Analytics** — leads/customers, interaction timelines, Recharts dashboards.
- **Background jobs** — Celery + Redis + Beat for processing, follow-ups, reports, CRM sync.
- **Security** — bcrypt hashing, rate limiting, tenant isolation, audit logging, CORS, HTTPS-ready.

See [`frontend/README.md`](frontend/README.md) and [`backend/README.md`](backend/README.md)
for details.

## Status

✅ Frontend — complete & runnable
✅ Backend — complete & runnable (auth, models, AI, workflow engine, Celery, Docker)
✅ Production auth — sign-up (new tenant) + sign-in against the real backend; no demo data by default
✅ Verified end-to-end: register → sign in → ingest → AI classify → workflow run → analytics
