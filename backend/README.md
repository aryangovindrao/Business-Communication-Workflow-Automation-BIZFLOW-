# BizFlow — Backend (FastAPI)

The API for the **AI-Powered Business Communication Workflow Automation Platform**.

Multi-tenant, JWT + RBAC, a provider-agnostic AI layer, a workflow engine, and
Celery background jobs. Runs on **SQLite out of the box** (zero setup) and on
**PostgreSQL + pgvector** in production. Responses are camelCase, matching the
frontend types exactly.

---

## Quick start (local, SQLite, no Docker)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
copy .env.example .env          # optional; sensible defaults work without it
uvicorn app.main:app --reload --port 8000
```

- API:        http://localhost:8000
- Swagger UI:  http://localhost:8000/docs
- Health:      http://localhost:8000/health

On first run it creates the SQLite schema. There is **no demo data** — create
your account (and its organization) via sign-up:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","organizationName":"Jane Co","email":"jane@janeco.com","password":"Passw0rd!"}'
```

The first user of an organization is its **Admin**. Then sign in:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@janeco.com","password":"Passw0rd!"}'
```

### Demo data (optional)

To explore with a populated workspace, load the **Acme Corp** demo tenant
(messages, contacts, workflows, notifications). Either set `SEED_ON_STARTUP=true`
(loaded automatically each boot) or run the seeder on demand:

```bash
python -m app.db.seed
```

It's **idempotent** — re-running is a no-op, and it coexists with real
accounts as a separate tenant. Sign in with any seeded user (all share the
password `demo1234`):

| Email          | Role    |
| -------------- | ------- |
| alex@acme.io   | Admin   |
| priya@acme.io  | Manager |
| marcus@acme.io | Agent   |
| tom@acme.io    | Viewer  |

---

## Connect the frontend

The frontend talks to the backend by default. Vite proxies `/api` →
`http://localhost:8000`, so just run `npm run dev`, open the app, and **Create
one** to register your workspace. (Set `VITE_MOCK_MODE=true` only for offline
UI work on mock data.)

---

## Tech stack

FastAPI · SQLAlchemy 2.0 · Pydantic v2 · PyJWT · bcrypt · slowapi (rate limit) ·
Celery + Redis · Alembic · PostgreSQL + pgvector.

## Project structure

```
backend/
├── app/
│   ├── main.py              # app wiring, CORS, rate limiter, startup seed
│   ├── core/                # config, database, security (JWT/bcrypt), deps (RBAC), rate_limit
│   ├── models/              # 11 multi-tenant ORM tables
│   ├── schemas/             # Pydantic (camelCase) — mirror frontend types
│   ├── api/                 # routers: auth, users, messages, contacts,
│   │                        #   workflows, notifications, analytics, ai
│   ├── ai/                  # provider-agnostic: mock | huggingface | ollama
│   ├── workflows/engine.py  # trigger → condition → action engine
│   ├── integrations/        # Slack webhook, SMTP email
│   ├── services/            # audit log, notifications, analytics
│   ├── workers/             # Celery app + tasks + beat schedule
│   └── db/seed.py           # demo data mirroring the frontend
├── alembic/                 # migrations (production)
├── Dockerfile
└── requirements.txt
```

## API surface

```
POST   /api/auth/register       # new organization + admin user
POST   /api/auth/login          /api/auth/refresh        /api/auth/logout
GET    /api/users               PATCH /api/users/{id}/role            (Admin)
GET    /api/messages            GET   /api/messages/{id}
POST   /api/messages            # ingest → AI classify → run workflows
PATCH  /api/messages/{id}/status   /assign     POST /{id}/read /reply /reclassify
GET    /api/contacts            GET   /api/contacts/{id}
POST   /api/contacts            PATCH /api/contacts/{id}/status
GET    /api/workflows           GET/PUT/POST + PATCH /{id}/status      (editor roles)
GET    /api/workflow-runs
GET    /api/notifications       POST  /api/notifications/{id}/read  /read-all
GET    /api/analytics/summary
POST   /api/ai/classify-intent  /sentiment  /summarize  /reply
```

## Security

JWT access + refresh tokens · bcrypt password hashing · role-based access control
(Admin > Manager > Agent > Viewer) · per-tenant isolation on every query
(`organization_id`) · login rate limiting · audit logging (`audit_logs`) · CORS allowlist.

## AI layer

Provider selected by `AI_PROVIDER`:

- **mock** (default) — keyword heuristics, no keys, always works.
- **huggingface** — zero-shot intent (`bart-large-mnli`), sentiment, BART summary.
- **ollama** — local LLM (llama3/mistral/phi/gemma), fully offline.

## Workflow engine

On message ingest, active workflows whose **trigger** matches the event are
evaluated against their **condition** nodes (intent/sentiment/channel/…); matching
workflows run their **action** nodes — assign team, generate AI reply, Slack
notify, set priority, request approval, send email — and record a `WorkflowRun`.

## Background jobs (Celery)

```bash
celery -A app.workers.celery_app:celery_app worker --loglevel=info
celery -A app.workers.celery_app:celery_app beat   --loglevel=info
```

Tasks: `process_message`, `deliver_notification`, `run_followups`,
`generate_daily_report`, `sync_crm`. Beat schedules daily reports, hourly
follow-ups, and nightly CRM sync.

## Production (PostgreSQL + Docker)

```bash
# from the repo root
docker compose up --build
```

Brings up postgres (pgvector), redis, backend, celery worker + beat, and the
nginx-served frontend. Set `DATABASE_URL` to Postgres and run migrations:

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```
