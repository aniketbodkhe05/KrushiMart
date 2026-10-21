# Architecture

## Goals

KrushiMart connects local agricultural supply with demand while remaining useful when AI is absent.
The central product decision is that demand must be **explicit** and **explainable**: a failed search
alone is a weak signal, and no model is allowed to decide that a farmer should receive a notification.

## System context

```text
                         +---------------------------+
                         |  React SPA (Vite)         |
                         |  mock mode OR real API    |
                         +-------------+-------------+
                                       |
                           HTTP/JSON, JWT bearer
                                       |
                         +-------------v-------------+
                         | Spring Boot API           |
                         | auth, listings, requests  |
                         | DemandGap, notifications  |
                         +------+-------------+------+
                                |             |
                     JDBC/Flyway|             | HTTP (optional)
                                |             |
                    +-----------v---+   +-----v----------------+
                    | PostgreSQL 16 |   | FastAPI matcher      |
                    | durable state |   | normalize + match    |
                    +---------------+   +----------------------+
```

The browser never talks to the AI service directly. The backend owns authorization and applies its
own deterministic fallback if the Python service is slow, unavailable, or returns invalid data.

## Components

### Frontend

- React Router application shell with public marketplace routes and protected account routes.
- `services/` is the only layer that knows about HTTP or mock mode.
- `mocks/` implements the same service contracts over `localStorage` for offline demos.
- `AuthProvider` stores the JWT and public user snapshot; it reacts to a global 401 event by clearing
  the session.
- `useApi` provides a small loading/error/reload state machine for read screens.

See [frontend.md](frontend.md).

### Backend

Spring Boot packages are organized by feature rather than by technical layer:

```text
auth/          registration, login, current user
user/          profile and roles
product/       marketplace listings and search
search/        public search-event recording
request/       explicit product requests
demandgap/     bucket aggregation, scoring, eligibility, persistence
notification/  in-app inbox, request matches, opportunity alerts
contact/       consent-gated seller phone retrieval
matching/      optional AI client, validation, deterministic fallback
security/      JWT parsing, current-user lookup, security error writing
common/        shared errors and page response
config/        security, CORS, clock
```

Controllers validate transport input and delegate to services. Entities are never returned directly;
feature DTOs define the API shape. Spring Security marks most routes authenticated and uses method
authorization for farmer-only operations.

See [backend.md](backend.md).

### Database

PostgreSQL is the system of record. Flyway owns schema and demo-data evolution.

- `users` stores login identity, role, region, category preferences, and consent flags.
- `products` stores listings and seller ownership.
- `search_events` stores whether a search matched; unmatched events are demand signals.
- `product_requests` stores explicit demand.
- `demand_opportunities` stores current qualified/expired opportunities per category and region.
- `notifications` stores per-user in-app messages with optional related entity IDs.

The dev seed is a separate Flyway location enabled only by the `dev` profile. See
[database.md](database.md).

### AI service

The optional FastAPI service exposes `/health`, `/normalize`, and `/match` expected by the Java
`AiClient`. It normalizes English, Hindi, and Marathi agricultural terms and performs token-coverage
matching. It is deterministic and needs no external model, API key, or network access.

The backend wraps every call with a short timeout and validates the response, including candidate ID
membership and confidence range. Any failure falls back to Java heuristics. AI never participates in
DemandGap scoring.

See [ai-matching.md](ai-matching.md).

## Key flows

### Listing creation and request matching

1. Farmer submits a listing through a farmer-protected endpoint.
2. Backend verifies the actor can sell.
3. Listing is persisted.
4. If currently available, the notification service looks for open requests in the same category and
   region, compares significant title tokens, and creates deduplicated `REQUEST_MATCH` notifications.

### Explicit request and DemandGap

1. Any authenticated user creates a product request.
2. Farmer opens the DemandGap feed. That request triggers a refresh, not a background scheduler.
3. Open requests and unmatched searches from the last 30 days are bucketed by category + approximate
   region.
4. Active supply is counted for each bucket.
5. Buckets are scored deterministically. Qualified buckets become `OPEN`; previously open buckets
   that no longer qualify become `EXPIRED`.
6. Eligible, opted-in farmers receive at most one notification per opportunity.
7. The response contains only opportunities matching the farmer's region or preferred categories.

### Contact consent

1. Buyer opens the contact route for a product.
2. Backend loads the product and seller.
3. Phone is returned only if `product.isAvailable()` and `seller.contactVisible` are both true.
4. Otherwise the response explicitly sets `phone: null` and explains why.

## Important design decisions

| Decision | Why |
| --- | --- |
| Explicit requests required for a DemandGap | Prevent inference from anonymous browsing alone and reduce creepy/weak signals |
| Deterministic scoring | Testable, explainable, predictable, and independent of AI availability |
| Category + region aggregates | Useful signal without exposing an individual's exact location or history |
| Consent-gated phone | Minimal privacy exposure; no account-to-account chat required for MVP |
| Mock mode on by default | A five-person team can demo the UI while backend work is incomplete |
| AI as an optional sidecar | The core marketplace has no hard dependency on a model or network |
| Client-side JWT in localStorage | Simple MVP tradeoff; see security limitations before production |

## Deliberate non-goals

No payments, delivery, order state machine, real-time chat, admin moderation console, background job
scheduler, message broker, Redis cache, or Kubernetes. Notification and opportunity refreshes occur
on demand. This keeps the MVP understandable and testable.

## Scaling path

If the MVP proved useful, the next steps would be:

1. Move DemandGap refresh to a scheduled job with a distributed lock.
2. Add refresh-token rotation and move browser tokens out of `localStorage`.
3. Add per-seller rate limits and listing moderation.
4. Add observability, structured audit events, and notification delivery channels.
5. Replace title-token matching with a reviewed embedding pipeline while keeping deterministic
   eligibility and scoring outside the model.
