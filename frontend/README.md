# BizFlow — Frontend

The React frontend for the **AI-Powered Business Communication Workflow Automation Platform**.

It runs **entirely on mock data** today (no backend required) and is architected so that switching to the real FastAPI backend is a one-line config change.

---

## Quick start

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

### Demo login

The app starts in **mock mode** — no real auth. On the login screen pick any
role to explore role-based access:

| Role    | Email          | Sees                                   |
| ------- | -------------- | -------------------------------------- |
| Admin   | alex@acme.io   | Everything, incl. Settings & role mgmt |
| Manager | priya@acme.io  | Everything incl. Settings              |
| Agent   | marcus@acme.io | All except Settings                    |
| Viewer  | tom@acme.io    | Read-only                              |

Any password (4+ chars) works in mock mode.

---

## Tech stack

| Concern        | Library                                   |
| -------------- | ----------------------------------------- |
| Framework      | React 19 + TypeScript + Vite 6            |
| Styling        | Tailwind CSS v3 + shadcn-style components  |
| Server state   | TanStack Query (React Query) v5           |
| Client state   | Zustand v5 (auth, UI/theme)               |
| Routing        | React Router v6 (+ RBAC guards)           |
| Forms          | React Hook Form + Zod                     |
| Charts         | Recharts                                  |
| Workflow canvas| React Flow (`@xyflow/react`)              |
| Icons / toasts | lucide-react / sonner                     |

---

## Project structure

```
src/
├── assets/                 # static assets
├── components/
│   ├── ui/                 # shadcn-style primitives (button, card, dialog…)
│   ├── layout/             # sidebar, topbar
│   ├── common/             # PageHeader, EmptyState, shared badges
│   ├── dashboard/          # StatCard
│   ├── inbox/              # MessageList, MessageDetail, AiAssistant
│   ├── crm/                # ContactDetailDialog
│   └── workflows/          # React Flow custom nodes
├── hooks/                  # React Query hooks (use-messages, use-contacts…)
├── layouts/                # AuthLayout, DashboardLayout
├── lib/                    # api-client, query-client, cn(), chart palette
├── pages/                  # Login, Dashboard, Inbox, CRM, Workflows,
│                           #   WorkflowBuilder, Analytics, Notifications, Settings
├── routes/                 # nav config + ProtectedRoute / RoleGuard
├── services/               # domain services (mock-aware) + AI layer
│   ├── ai/                 # provider-agnostic AI (mock | huggingface | ollama)
│   └── mock/               # in-memory seed database
├── store/                  # Zustand stores (auth, ui)
├── types/                  # shared domain types (mirror backend models)
└── utils/                  # formatting helpers
```

### Architectural notes

- **Service layer pattern.** Components never call `fetch` directly. They use
  React Query hooks → services (`services/*.ts`) → `lib/api-client.ts`. Each
  service has a `MOCK_MODE` branch (in-memory data) and a real-HTTP branch, so
  the UI is identical regardless of backend.
- **Type parity with the backend.** `src/types/index.ts` mirrors the planned
  SQLAlchemy/Pydantic models (multi-tenant via `organizationId`). When the API
  ships, responses drop straight into these types.
- **Provider-agnostic AI.** `services/ai/` defines an `AiProvider` interface
  with three implementations: a deterministic **mock** (default, offline), a
  **Hugging Face** Inference API provider (zero-shot intent, sentiment, BART
  summary), and a local **Ollama** provider. Selected via `VITE_AI_PROVIDER`.
- **RBAC.** `routes/protected-route.tsx` gates auth and role access; the sidebar
  and action buttons also respect `useAuthStore().hasRole(...)`.

---

## Connecting the real backend

1. Start the FastAPI backend on `http://localhost:8000` (Vite proxies `/api`).
2. Copy env and disable mock mode:

   ```bash
   cp .env.example .env
   # set:
   VITE_MOCK_MODE=false
   VITE_API_BASE_URL=/api
   VITE_AI_PROVIDER=huggingface   # or ollama
   ```

3. Restart `npm run dev`. Every service now issues real HTTP requests; no
   component changes required.

### Expected API surface (consumed by the services)

```
POST   /api/auth/login            POST /api/auth/refresh   POST /api/auth/logout
GET    /api/messages              GET  /api/messages/:id
PATCH  /api/messages/:id/status   POST /api/messages/:id/reply
GET    /api/contacts              PATCH /api/contacts/:id/status   POST /api/contacts
GET    /api/workflows             PUT  /api/workflows/:id          POST /api/workflows
GET    /api/workflow-runs
GET    /api/notifications         POST /api/notifications/read-all
GET    /api/analytics/summary
GET    /api/users                 PATCH /api/users/:id/role
POST   /api/ai/classify-intent    POST /api/ai/sentiment   POST /api/ai/summarize  POST /api/ai/reply
```

---

## Environment variables

See [`.env.example`](.env.example). Key flags:

| Var                 | Default | Purpose                                       |
| ------------------- | ------- | --------------------------------------------- |
| `VITE_MOCK_MODE`    | `true`  | Run on in-memory mock data (no backend)       |
| `VITE_API_BASE_URL` | `/api`  | Backend base URL (proxied in dev)             |
| `VITE_AI_PROVIDER`  | `mock`  | `mock` \| `huggingface` \| `ollama`           |

---

## Status

✅ Frontend — built and runnable (this package).
✅ Backend — built and runnable in [`../backend`](../backend) (FastAPI, auth/RBAC,
   AI layer, workflow engine, Celery). Set `VITE_MOCK_MODE=false` to use it.
