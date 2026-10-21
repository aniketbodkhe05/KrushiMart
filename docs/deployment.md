# Deployment

The repository includes a Docker Compose demo stack and individual Dockerfiles. The stack was **not
run** in this development environment because Docker was unavailable. Use the commands below and
verify container health on a Docker-capable machine before relying on them.

## Compose topology

```text
browser :3000
   |
   v
frontend / Nginx :80
   |-- /            -> built React SPA
   |-- /api/*       -> backend:8080
                         |
                         |-- db:5432 (PostgreSQL)
                         |-- ai:8000 (optional FastAPI)
```

Compose services:

| Service | Image/build | Port | Health |
| --- | --- | --- | --- |
| `db` | `postgres:16-alpine` | internal 5432 | `pg_isready` |
| `ai` | `deployment/ai.Dockerfile` | 8000 | Python `urllib` to `/health` |
| `backend` | `deployment/backend.Dockerfile` | 8080 | curl to public product search |
| `frontend` | `deployment/frontend.Dockerfile` | 3000 → 80 | `wget` on `/` |

## Run

```powershell
Copy-Item .env.example .env
# edit JWT_SECRET and passwords in .env before sharing
docker compose up --build
```

Then open:

- App: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- AI docs: `http://localhost:8000/docs`

The frontend image is built with `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL=/api`, so it uses the
real backend. Nginx handles SPA fallback and proxies API calls, avoiding cross-origin issues.

## Demo profile

Compose defaults `SPRING_PROFILES_ACTIVE=dev`. That activates the Flyway seed with six demo accounts
(password `password`). It is appropriate only for a local/demo deployment.

For any shared environment:

1. Set `SPRING_PROFILES_ACTIVE=prod` (or leave it unset).
2. Ensure the `db/seed` location is not loaded.
3. Set a unique, strong `JWT_SECRET` (at least 32 bytes of entropy).
4. Use strong PostgreSQL credentials.
5. Restrict `CORS_ALLOWED_ORIGINS` to the actual frontend origin.
6. Decide whether the optional AI service should be exposed publicly; the Compose file publishes
   port 8000 for convenience, not necessity.

## Environment variables

Root `.env` is consumed by Compose. Important values:

```dotenv
POSTGRES_DB=krushimart
POSTGRES_USER=krushimart
POSTGRES_PASSWORD=change-me
JWT_SECRET=change-me-to-a-long-random-secret
SPRING_PROFILES_ACTIVE=dev
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
AI_SERVICE_ENABLED=true
```

Inside Compose, `DB_URL` is overridden to `jdbc:postgresql://db:5432/<db>` and `AI_SERVICE_URL` to
`http://ai:8000`; do not point them at localhost inside containers.

The frontend build-time variables cannot be changed after image build without rebuilding:

- `VITE_USE_MOCKS=false`
- `VITE_API_BASE_URL=/api`

## Dockerfile notes

### Backend

- Multi-stage Maven 3.9.9 + Temurin 21 build.
- Runtime is Temurin 21 JRE on Alpine with curl for health checks.
- Runs as unprivileged `krushimart` user.
- Uses `-XX:MaxRAMPercentage=75`.

### AI service

- Python 3.13 slim, non-root user.
- Installs `ai-service/requirements.txt`.
- Starts Uvicorn on `0.0.0.0:8000`.
- No model download or API key.

### Frontend

- Node 22 Alpine build with `npm ci`.
- Nginx 1.27 Alpine runtime.
- Copies `deployment/nginx/default.conf`.
- Runs Nginx as its default user, serves static assets and proxies `/api/`.

## Nginx configuration

`deployment/nginx/default.conf`:

- SPA fallback to `index.html`.
- One-year immutable cache for `/assets/`.
- `gzip` for common text/JS/JSON/SVG assets.
- Proxy headers for host, client IP, and scheme.
- 5s connect / 30s read timeout for API requests.
- Basic security headers.

It does not include TLS; terminate TLS at a load balancer/reverse proxy or add certificates.

## Non-Docker manual deployment

1. Build the frontend with `VITE_USE_MOCKS=false` and the public API URL.
2. Serve `frontend/dist` from any static host.
3. Run the backend jar:

   ```powershell
   cd backend
   .\mvnw.cmd package -DskipTests
   java -jar target/krushimart-backend-0.1.0.jar
   ```

4. Provide PostgreSQL, Flyway, JWT, CORS, and optional AI environment variables.
5. Run the AI service with Uvicorn or a process manager if desired.
6. Configure CORS if frontend and API are on different origins.

## Data and backups

- Production uses PostgreSQL; back up the database and test restores.
- Flyway migrations should run once per deployment, ideally as a pre-start job.
- Never mount the dev seed location in production.
- `docker compose down -v` deletes the database volume. Use only for local reset.

## Health checks and rollout

- Backend health is approximated through public `GET /api/products?size=1`. A dedicated actuator
  health check with database details would be better for production.
- AI health is `/health`.
- Frontend health is the Nginx root.
- Start order: database healthy → backend → frontend. AI can fail without blocking core usage.
- Rolling restarts should wait for the database before starting new backend instances.

## Production checklist

- [ ] Replace all demo secrets and credentials.
- [ ] Disable the dev profile and seed.
- [ ] Add TLS and a Content Security Policy.
- [ ] Add rate limiting and abuse protection.
- [ ] Add refresh tokens or safer cookie-based sessions.
- [ ] Configure backups, log retention, and monitoring.
- [ ] Run `npm audit`, dependency scanning, and container scanning.
- [ ] Test migrations on a copy of production data.
- [ ] Move DemandGap refresh to a scheduled worker.
- [ ] Perform accessibility and cross-browser testing.
- [ ] Verify Docker/Compose on a real Docker host.
