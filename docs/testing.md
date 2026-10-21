# Testing and verification

This document records what was actually executed. It distinguishes automated tests, browser smoke
checks, and unverified areas.

## Verified results

| Area | Command | Result |
| --- | --- | --- |
| Backend tests | `backend\mvnw.cmd -q test` | **16 passed**, 0 failures, 0 errors |
| Backend package | `backend\mvnw.cmd -q package -DskipTests` | **Passed** |
| AI tests | `ai-service\.venv\Scripts\python.exe -m pytest` | **26 passed**, 1 third-party warning |
| Frontend lint | `cd frontend; npm run lint` | **0 errors, 0 warnings** |
| Frontend production build | `cd frontend; npm run build` | **Passed**, 400.97 kB JS / 121.63 kB gzip |
| Browser smoke | Chrome headless against `vite preview` | **21 checks passed**, 0 runtime errors |
| AI live smoke | Uvicorn on port 8000 plus HTTP calls | `/health`, `/normalize` with Marathi text, and `/match` returned expected UTF-8 JSON |

Environment used: Windows, Node 24.22.0, npm 11.19.1, Java 23.0.1 with Java 21 target, Python 3.13.15.

## Backend tests

```powershell
cd backend
.\mvnw.cmd test
```

| Test class | Focus |
| --- | --- |
| `AuthProductApiTest` | Registration, login, public product search, authenticated create |
| `ProductServiceTest` | Product search, ownership, deactivate behavior |
| `DemandScoringServiceTest` | Formula clamps, recency, supply penalty, qualification |
| `FallbackMatchingServiceTest` | Multilingual normalization and fallback matching |
| `DemandGapIntegrationTest` | Aggregation, duplicate suppression, farmer notification, request matching |

Tests run with the `test` profile, H2 in PostgreSQL mode, Flyway disabled, and Hibernate
`create-drop`. Mockito self-attaches dynamically and Spring prints a generated default password
warning; both are framework notices, not test failures.

Not covered:

- A test against real PostgreSQL 16.
- Concurrent DemandGap refresh/upsert races.
- A full HTTP test of every controller endpoint.
- JWT expiry and malformed-token permutations beyond filter behavior.
- Contact-consent API test.

## AI tests

```powershell
cd ai-service
.\.venv\Scripts\python.exe -m pytest
```

26 tests cover normalization, language hints, all shared contract fixtures, confidence behavior,
negative matching, API request/response shapes, and validation errors. The warning comes from
Starlette's deprecated `anyio.abc.BlockingPortal` alias under Python 3.13.

## Frontend checks

```powershell
cd frontend
npm install
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The production build transforms about 1,700 modules. The bundle is not code-split; acceptable for an
MVP, but route-level lazy loading would reduce initial payload.

Browser smoke procedure:

1. Serve `dist/` with Vite preview.
2. Use Chrome headless with CDP.
3. Visit `/`, `/login`, `/marketplace`.
4. Confirm `/profile` redirects to `/login` when unauthenticated.
5. Click the farmer demo sign-in.
6. Inspect `/demandgap`, `/requests`, `/profile`, and `/notifications`.
7. Collect runtime exceptions and console errors.

Observed after login: Ramesh's profile rendered, DemandGap showed the qualified Nashik feed, requests
were empty for this farmer, and notifications showed two seeded items with one unread. Marking the
unread item read decreased the page and navbar counts immediately. Product detail, contact, new
listing, new request, registration, missing-product, and unknown-route pages also rendered without
runtime errors.

This is a smoke check, not a maintained E2E suite. No Playwright/Cypress tests exist. Browser checks
used mock mode, not the live Spring Boot API.

## Manual API scenarios

Detailed requests and expected outcomes are in
[`../tests/test-scenarios.md`](../tests/test-scenarios.md). Summary:

| Scenario | Expected |
| --- | --- |
| Public marketplace search | 200 and page shape |
| Customer login | 200 with JWT and `CUSTOMER` role |
| Customer creates listing | 403 |
| Farmer creates listing | 201 and available listing |
| Non-owner edits listing | 403 |
| Customer opens DemandGap | 403 |
| Farmer opens DemandGap | 200 only for eligible region/category |
| Contact with consent + available | phone present |
| Contact after deactivate or consent off | phone null |
| AI service stopped | search/matching still works via fallback |
| Invalid registration phone/password | 400 with field details |

## Contract checks

`contracts/openapi.yaml` is hand-maintained; it is not generated or compared automatically. Keep DTO
changes synchronized manually. `contracts/sample-data/ai-match-cases.json` is executed by the Python
test suite.

The frontend mock layer can drift from the backend because it has no shared generated client. The
service files and backend DTO tests are the current guardrails. A future improvement is generating a
typed client from OpenAPI (without introducing TypeScript into the app if undesired).

## What is unverified

- Docker build and `docker compose up` (Docker unavailable on the development machine).
- Nginx proxy behavior and container health checks.
- Frontend against the live Spring Boot API (browser smoke used the mock adapters).
- Backend against real PostgreSQL/Flyway at runtime (unit/integration tests use H2).
- Solr/PostgreSQL-specific constraint behavior beyond the H2 compatibility mode.
- Cross-browser testing (only headless Chrome was used).
- Mobile device testing, screen-reader audit, and visual regression.
- Real AI provider behavior (the service is deterministic and offline by design).
- Load, penetration, and dependency security testing.

## Dependency audit

`npm install` reported 11 vulnerabilities (5 moderate, 6 high) in the dependency tree. Most are
transitive/dev-tool related. No breaking `npm audit fix --force` was applied. Review before any
deployment:

```powershell
cd frontend
npm audit
```

Maven and Python dependencies were not scanned with external tools in this environment.

## Suggested CI

A minimal pipeline should run:

1. `cd backend && ./mvnw test`
2. `cd ai-service && pip install -r requirements.txt && pytest`
3. `cd frontend && npm ci && npm run lint && npm run build`
4. Optional Docker build and Compose smoke test on a Docker-capable runner.

Cache Maven `~/.m2`, pip, and npm download caches. Upload Surefire and pytest reports as artifacts.
