# Backend guide

Java 21 + Spring Boot 3.4 REST API under `backend/`.

## Run and build

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
.\mvnw.cmd package -DskipTests
```

The Maven wrapper is configured for Maven 3.9.9. It was exercised successfully in this environment.
`JAVA_HOME` should point to JDK 21 or newer. The build targets Java release 21.

## Configuration

Main config: `src/main/resources/application.yml`.

| Setting | Env var | Default |
| --- | --- | --- |
| HTTP port | `SERVER_PORT` | `8080` |
| Database URL | `DB_URL` | `jdbc:postgresql://localhost:5432/krushimart` |
| DB user/password | `DB_USERNAME`, `DB_PASSWORD` | `krushimart` / `krushimart_dev` |
| JWT secret | `JWT_SECRET` | dev-only placeholder |
| JWT lifetime | `JWT_EXPIRATION_MS` | 86400000 |
| CORS origins | `CORS_ALLOWED_ORIGINS` | local Vite origins |
| AI base URL | `AI_SERVICE_URL` | `http://localhost:8000` |
| AI enabled | `AI_SERVICE_ENABLED` | `true` |

Flyway runs `db/migration`. The `dev` profile adds `db/seed` and debug logging. Tests use the `test`
profile with H2 in PostgreSQL compatibility mode and no Flyway.

`spring.jpa.hibernate.ddl-auto=validate` means schema and entities must agree. Never switch this to
`update` for shared environments.

## Package structure

```text
com.krushimart
  auth/          AuthController, AuthService, request/response DTOs
  user/          User entity, roles, repository, profile service
  product/       Product entity, specifications, mapper, service, controller
  search/        SearchEvent recording
  request/       ProductRequest lifecycle
  demandgap/     scoring, aggregation, persistence, farmer feed
  notification/  inbox and notification creation
  contact/       consent-gated seller card
  matching/      AI client, proxy, validation, deterministic fallback
  security/      JWT service/filter, current user, error writer
  common/        ApiError, PageResponse, exceptions
  config/        SecurityConfig, TimeConfig
```

Feature-first organization keeps controllers, DTOs, entities, repositories, and services close to the
behavior they implement.

## Request lifecycle

1. `JwtAuthenticationFilter` reads a bearer token, validates it, loads the user, and puts the entity in
   the security context. Invalid tokens do not crash the request; protected routes return 401.
2. `SecurityConfig` applies public route rules and authentication for everything else.
3. Method security checks farmer-only operations.
4. Controllers validate request bodies with Bean Validation.
5. Services enforce ownership, eligibility, and domain invariants.
6. `GlobalExceptionHandler` maps exceptions to the stable `ApiError` shape.
7. DTO records serialize as camelCase JSON.

## Domain services

### `ProductService`

- Search with JPA Specifications.
- Safe sort whitelist; unknown fields fall back to `createdAt`.
- Page size clamped to 1–50.
- Owner-only update/deactivate.
- Notifies matching open requests only when a saved listing is available.

### `NotificationService`

- Lists and marks read only the current user's notifications.
- Request matching uses significant tokens from title, same category, same region.
- Deduplicates `REQUEST_MATCH` by user + product + request.
- Deduplicates `DEMAND_OPPORTUNITY` by user + opportunity.
- Caps fan-out at 20 per operation.

### `DemandGapService`

- Refreshes buckets from a 30-day window.
- Scores via `DemandScoringService`.
- Upserts by category/region and expires stale opportunities.
- Filters the farmer feed by region or preferred categories.
- Sends notifications to opted-in eligible farmers.
- Requires a seller role and throws 403 otherwise.

### `MatchingService`

- Attempts the optional Python service.
- Validates returned IDs and confidence.
- Falls back on any failure.
- Health endpoint always returns 200 with `fallback` state on failure.

## Security

- BCrypt password hashing.
- Stateless JWT authentication, no server session.
- CSRF disabled for bearer-token API.
- CORS allow-list from configuration.
- Generic authentication errors.
- Method and ownership authorization.
- No stack traces in client responses.

Read [security-privacy.md](security-privacy.md) before any real deployment.

## API documentation

Springdoc exposes:

- Swagger UI: `/swagger-ui.html`
- JSON: `/v3/api-docs`

The hand-maintained contract is `contracts/openapi.yaml`; keep it aligned when endpoints change.

## Testing

Tests live in `backend/src/test/java`. Last verified run: **16 tests, 0 failures**.

- `AuthProductApiTest`: registration/login, public search, authenticated listing creation.
- `ProductServiceTest`: search behavior and ownership rules.
- `DemandScoringServiceTest`: formula boundaries and qualification.
- `FallbackMatchingServiceTest`: multilingual fallback normalization/matching.
- `DemandGapIntegrationTest`: aggregated demand, deduplication, notifications, request matching.

Maven output includes Mockito self-attach and default Spring Security password warnings. Neither
indicates a failing test. The generated default password is not used by the JWT flow.

## Known gaps before production

- No refresh tokens, rate limiting, or phone verification.
- No scheduled job for DemandGap; refresh is triggered by farmer requests.
- No database row locking around opportunity upserts under concurrent refresh.
- Notification deduplication is check-then-insert, not a database unique constraint.
- No pagination on notifications or requests.
- No file uploads or image handling.
- No integration test against real PostgreSQL; tests use H2 compatibility mode.
