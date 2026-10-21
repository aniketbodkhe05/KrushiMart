# KrushiMart

A local agricultural marketplace built around an explicit, explainable demand signal.

Farmers list products they have. Buyers search, contact consenting sellers, or submit an explicit
request when supply is missing. Those requests, plus unmatched searches and current supply, produce a
deterministic **DemandGap Radar** that shows farmers where demand is genuinely unmet.

This is an MVP intended for a two-week student team build. Payments, delivery, chat, and an admin
console are intentionally out of scope.

## What works

- Phone/password registration and JWT sign-in for farmer, customer, and dual roles.
- Public marketplace search with query, category, region, availability, sorting, and pagination.
- Farmer-owned listing create, edit, and deactivate flows.
- Explicit product requests with "My requests" history.
- Server-side DemandGap scoring, thresholding, eligibility, notification deduplication, and expiry.
- Contact consent: a seller phone number is only returned when the seller opted in and the listing
  is available.
- Optional Python normalization/matching service with automatic deterministic Java fallback.
- React frontend with a complete in-browser mock mode for demos without the backend.

## Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios, Lucide icons |
| Backend | Java 21, Spring Boot 3.4, Spring Security, JWT, JPA, Flyway, PostgreSQL |
| AI service | Python 3.13, FastAPI, Pydantic 2, deterministic multilingual heuristics |
| Deployment | Docker Compose, PostgreSQL 16, Nginx |

No TypeScript is used. Frontend source files are `.js`/`.jsx`.

## Repository layout

```text
KrushiMart/
  frontend/          React SPA and mock API
  backend/           Spring Boot API, Flyway migrations, tests
  ai-service/        Optional FastAPI matching service and tests
  contracts/         OpenAPI contract, JSON schemas, shared fixtures
  database/seed/     Optional supplementary local SQL
  deployment/        Dockerfiles and Nginx configuration
  docs/              Architecture, API, database, security, testing, team docs
  tests/             Manual API/integration test scenarios
  docker-compose.yml
```

## Fastest demo: frontend only

Requirements: Node.js 20+.

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Mock mode is the default and persists data in browser `localStorage`. Use one of these accounts, or
the quick sign-in buttons on the login page:

| Role | Name | Phone | Password |
| --- | --- | --- | --- |
| Farmer, Nashik | Ramesh Patil | `9876543210` | `password` |
| Farmer, Pune | Sunita Deshmukh | `9876543211` | `password` |
| Farmer, Nagpur | Vijay Jadhav | `9876543212` | `password` |
| Customer, Nashik | Asha Kulkarni | `9876543213` | `password` |
| Customer, Nashik | Ganesh Pawar | `9876543214` | `password` |
| Customer, Nashik | Meera Shinde | `9876543215` | `password` |

Good demo path:

1. Sign in as customer **Asha Kulkarni** and submit a mini-tiller request.
2. Sign out and sign in as farmer **Ramesh Patil**.
3. Open **DemandGap** to see the qualified Nashik machinery gap and its score explanation.
4. Open **Notifications** to read the seeded demand alert, then create a matching listing.
5. Sign back in as the customer to contact the consenting seller from the product page.

## Full stack with Docker Compose

Requirements: Docker Desktop with Compose v2.

```powershell
Copy-Item .env.example .env
docker compose up --build
```

- App: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- AI service docs: `http://localhost:8000/docs`

The Compose stack sets `SPRING_PROFILES_ACTIVE=dev`, so Flyway loads the six demo users and sample
listings. Change `JWT_SECRET` and database credentials before exposing the stack to anyone else.

Docker files are included but could not be executed in this development environment because Docker
was unavailable. Treat container startup as unverified until smoke-tested on a Docker host.

## Local development without Docker

### 1. PostgreSQL

Create a database matching `.env.example`:

```sql
CREATE USER krushimart WITH PASSWORD 'krushimart_dev';
CREATE DATABASE krushimart OWNER krushimart;
```

### 2. AI service (optional)

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

If this service is down, the backend still serves matching through its deterministic fallback.

### 3. Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

On macOS/Linux use `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`.

The backend reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`,
`AI_SERVICE_URL`, and `AI_SERVICE_ENABLED`. Defaults are suitable for local development only.

### 4. Frontend against the real API

Create `frontend/.env`:

```dotenv
VITE_USE_MOCKS=false
VITE_API_BASE_URL=/api
```

Then:

```powershell
cd frontend
npm run dev
```

Vite proxies `/api` to `http://localhost:8080`.

## Verification status

Commands were run in this repository on Windows:

| Check | Command | Result |
| --- | --- | --- |
| Backend tests | `backend\mvnw.cmd -q test` | 16 tests passed |
| Backend package | `backend\mvnw.cmd -q package -DskipTests` | Passed |
| AI tests | `ai-service\.venv\Scripts\python.exe -m pytest` | 26 tests passed |
| Frontend lint | `npm run lint` | 0 errors, 0 warnings |
| Frontend build | `npm run build` | Passed |
| Browser smoke (mock) | Headless Chrome against `npm run preview` | 21 checks passed, 0 runtime errors |

`docs/testing.md` is the source of truth for what was actually executed and what remains unverified.

## API

The canonical contract is [`contracts/openapi.yaml`](contracts/openapi.yaml). The backend also exposes
live OpenAPI JSON at `/v3/api-docs`.

Public routes include `GET /api/products/**`, `POST /api/search-events`, and `/api/auth/**`. All other
routes require `Authorization: Bearer <jwt>`.

See [`docs/api.md`](docs/api.md) for endpoints, sample payloads, and error handling.

## DemandGap in one paragraph

For each `(category, region)` bucket in the last 30 days, the backend counts distinct open requests,
requesters, unmatched searches, and active supply. The score is capped, weighted, and penalized by
existing supply. A bucket qualifies only when it has at least one explicit request and a score of 30
or higher. Eligibility is limited to opted-in farmers in the region or with the category preference.
The score never depends on the AI service. Full formula and worked example:
[`docs/demandgap.md`](docs/demandgap.md).

## Documentation

- [Architecture](docs/architecture.md)
- [API guide](docs/api.md)
- [Database](docs/database.md)
- [DemandGap scoring](docs/demandgap.md)
- [AI matching](docs/ai-matching.md)
- [Security and privacy](docs/security-privacy.md)
- [Frontend guide](docs/frontend.md)
- [Backend guide](docs/backend.md)
- [Testing](docs/testing.md)
- [Deployment](docs/deployment.md)
- [Team work plan](docs/team-plan.md)
- [Manual test scenarios](tests/test-scenarios.md)

## Non-goals

- Payments, escrow, delivery, or order fulfilment.
- Real-time chat. Contact happens by phone with explicit consent.
- AI-generated pricing or opaque demand decisions.
- Surveillance of individual search histories. Aggregates are category/region level.
- Production-grade observability, horizontal scaling, or multi-tenant administration.
