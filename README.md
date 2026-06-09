# Sentinel AI — AI Cyber Security Threat Analyzer

> Production-ready, AI-native cybersecurity intelligence platform.
> Detects, analyzes, explains, visualizes and monitors cyber threats with
> a real-time dashboard, AI co-pilot, malware engine, phishing detector,
> live event stream, CVE search, and PDF threat reports.

```
┌──────────────────────┐        ┌────────────────────┐       ┌────────────┐
│   Next.js 14 (App)   │  HTTP  │  FastAPI / SQLA    │  SQL  │ PostgreSQL │
│   Tailwind + Framer  │ <────▶ │  Auth · AI · SOC   │ ────▶ │   16       │
│   Recharts · Sonner  │        │  Groq AI           │       └────────────┘
└──────────────────────┘        └────────────────────┘
```

## Stack

| Layer            | Tech                                                              |
| ---------------- | ----------------------------------------------------------------- |
| Frontend         | Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Recharts, Sonner, lucide-react |
| Backend          | FastAPI, SQLAlchemy 2, Pydantic v2, JWT (python-jose), passlib/bcrypt, ReportLab |
| AI               | Groq AI via REST with deterministic heuristic fallback           |
| Database         | PostgreSQL 16                                                     |
| Streaming        | Server-Sent Events for live threat feed                           |
| Intel            | NVD CVE search, curated global feed                               |
| Deployment       | Docker / docker-compose                                           |

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── ai/             # Groq client + prompts
│   │   ├── api/            # FastAPI routers
│   │   ├── core/           # config, JWT, hashing
│   │   ├── db/             # SQLAlchemy session
│   │   ├── models/         # ORM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # threat engine, dashboard, PDF
│   │   ├── utils/          # log/IOC parsing
│   │   └── main.py         # FastAPI entry
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── run.sh              # local dev convenience script
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (marketing) # landing
│   │   │   ├── (auth)      # login / signup / forgot / reset
│   │   │   └── dashboard/  # SOC console (overview, threats, malware, phishing, chat, ips, intel, cve, live, timeline, incidents, notifications)
│   │   ├── components/
│   │   ├── lib/            # API client, auth context, utils
│   │   ├── hooks/
│   │   ├── styles/         # globals.css with design system
│   │   └── types/
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick start (local dev)

### 1. Start PostgreSQL

Either use Docker:

```bash
docker run -d --name cyber_db \
  -e POSTGRES_DB=cyber_threat_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine
```

…or your local Postgres with a `cyber_threat_db` database.

### 2. Backend

```bash
cd backend
cp .env.example .env       # then edit GROQ_API_KEY (optional — heuristic fallback works without)
./run.sh                   # creates venv, installs deps, starts uvicorn on :8000
```

The first request triggers `Base.metadata.create_all` so all tables come up automatically.
Docs live at <http://localhost:8000/api/docs>.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

The Next.js dev server proxies `/api/*` → backend (see `next.config.mjs`).

### 4. Sign up & explore

Open <http://localhost:3000>, click **Get started**, and you'll land in the SOC console.

## Run with docker-compose

```bash
cp .env.example .env
# or in PowerShell:
# copy .env.example .env

docker compose up --build
```

This spins up Postgres + FastAPI + Next.js. App available at <http://localhost:3000>.

## Environment

### Backend (`backend/.env`)

| Var                          | Default                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`               | `postgresql+psycopg2://postgres:postgres@localhost:5432/cyber_threat_db` |
| `SECRET_KEY`                 | _change me_                                                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `60`                                                               |
| `REFRESH_TOKEN_EXPIRE_DAYS`  | `7`                                                                |
| `ALGORITHM`                  | `HS256`                                                            |
| `FRONTEND_URL`               | `http://localhost:3000`                                            |
| `GROQ_API_KEY`                | _empty → heuristic fallback engages_                               |
| `GROQ_MODEL`                  | `groq-1.5-mini`                                                     |
| `ENVIRONMENT`                | `development`                                                      |

### Frontend (`frontend/.env.local`)

| Var                    | Default                  |
| ---------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000`  |
| `NEXT_PUBLIC_APP_NAME` | `Sentinel AI`            |

## Feature tour

| Feature              | Path                                | Notes |
| -------------------- | ----------------------------------- | ----- |
| Landing              | `/`                                 | Hero, features, workflow, intelligence radar, pricing |
| Auth                 | `/login` `/signup` `/forgot-password` `/reset-password` | Cookie session + JWT |
| Overview             | `/dashboard`                        | KPIs, severity donut, 7-day chart, top attacks, recent activity |
| Threat Analyzer      | `/dashboard/threats`                | Paste/upload logs, AI detect threats, MITRE+chain, PDF export |
| Phishing Detector    | `/dashboard/phishing`               | URL/email/message scan, verdict gauge |
| Malware Engine       | `/dashboard/malware`                | Behaviour, IOCs, family, severity gauge |
| AI SOC Co-pilot      | `/dashboard/chat`                   | Markdown answers, sessions sidebar |
| Live Monitor         | `/dashboard/live`                   | SSE stream of synthetic attack events |
| Attack Timeline      | `/dashboard/timeline`               | Chronological reconstruction with filters |
| Incidents            | `/dashboard/incidents`              | Create + track investigations |
| Suspicious IPs       | `/dashboard/ips`                    | Block/unblock with one click |
| Threat Intel Feed    | `/dashboard/intel`                  | Curated global alerts + tenant pulse |
| CVE Search           | `/dashboard/cve`                    | NVD-backed search with CVSS color-coding |
| Notifications        | `/dashboard/notifications`          | Severity-aware alerts |

## API

Interactive Swagger / Redoc at:

- `GET /api/docs`
- `GET /api/redoc`
- `GET /api/openapi.json`

Auth uses an HTTP-only cookie (`ai_cyber_session`) **and** accepts `Authorization: Bearer <token>` for programmatic access.

## Design system

- **Theme**: dark cyber / cyberpunk, neon glows, glassmorphism, animated grid + radar
- **Color tokens**: `cyber-cyan #22d3ee`, `cyber-violet #a78bfa`, `cyber-purple #7c3aed`, `cyber-rose #fb7185`, `cyber-green #34d399`
- **Typography**: Inter (sans), JetBrains Mono (code/HUD)
- **Motion**: Framer Motion across hero, panels, charts, live feed, gauges, timeline

## Notes on the AI integration

`backend/app/ai/groq_client.py` calls the Groq REST endpoint with JSON-mode for analytic
endpoints (threat / phishing / malware) and free-form chat for the SOC assistant.

If `GROQ_API_KEY` is empty or the upstream fails, every analyzer transparently falls back to a
deterministic heuristic engine (see `services/threat_engine.py`) — so the platform stays
fully functional in demos.

## Production checklist

- Set a long random `SECRET_KEY` (`openssl rand -hex 48`).
- Set `ENVIRONMENT=production` so cookies are flagged `Secure`.
- Put the FastAPI service behind TLS (Caddy / nginx / Cloud Run / Fly.io).
- Use a managed Postgres and back the database up.
- Provide a real `GROQ_API_KEY`.
- Restrict CORS via `FRONTEND_URL` to your real origin.
- Consider Alembic migrations once you start changing the schema.

## License

MIT — for portfolio, demo and educational use.
