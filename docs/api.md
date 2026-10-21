# API guide

Canonical machine-readable contract: [`../contracts/openapi.yaml`](../contracts/openapi.yaml).
Live documentation from the running backend: `http://localhost:8080/swagger-ui.html`.

## Base URLs

| Environment | Base URL |
| --- | --- |
| Vite frontend | `/api` (proxied to `http://localhost:8080`) |
| Backend direct | `http://localhost:8080/api` |
| Docker frontend | `/api` (Nginx proxies to the backend service) |

All payloads are JSON with camelCase fields. Timestamps are ISO-8601 instants. IDs are numeric.

## Authentication

Register or log in to receive:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresInMs": 86400000,
  "user": {
    "id": 1,
    "fullName": "Ramesh Patil",
    "phone": "9876543210",
    "role": "FARMER",
    "region": "Nashik",
    "preferredCategories": ["MACHINERY", "TOOLS", "IRRIGATION"],
    "notifyOptIn": true,
    "contactVisible": true,
    "createdAt": "2026-09-11T05:00:00Z"
  }
}
```

Send `Authorization: Bearer <jwt>` on protected routes. There is no refresh endpoint in the MVP. Tokens
expire after `JWT_EXPIRATION_MS` (24 hours by default) and the browser returns to the login page on a
401 from a non-auth route.

### Demo credentials

All demo users have password `password`. See the root README for the six phones.

## Roles

| Role | Browse | Request | List products | DemandGap | Contact consent |
| --- | --- | --- | --- | --- | --- |
| Anonymous | Yes | No | No | No | No |
| `CUSTOMER` | Yes | Yes | No | No | Yes |
| `FARMER` | Yes | Yes | Yes | Yes | Yes |
| `BOTH` | Yes | Yes | Yes | Yes | Yes |

A seller phone is returned only if the seller enabled `contactVisible` and the listing is currently
available.

## Endpoints

### Auth and profile

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create account and return JWT |
| `POST` | `/api/auth/login` | No | Phone/password login |
| `GET` | `/api/auth/me` | Yes | Current public user |
| `GET` | `/api/users/me` | Yes | Current public user |
| `PUT` | `/api/users/me` | Yes | Update name, region, preferences, consent |

Registration rules:

- `fullName`: 2–120 characters.
- `phone`: 10 digits starting with 6–9.
- `password`: 8–72 characters.
- `role`: `FARMER`, `CUSTOMER`, or `BOTH`.
- `region`: 2–80 characters.
- `preferredCategories`: optional array of category enums.
- `notifyOptIn`: optional boolean, defaults to `true`.
- New accounts start with `contactVisible: true`.

```json
POST /api/auth/register
{
  "fullName": "Kiran More",
  "phone": "9876500000",
  "password": "long-enough-password",
  "role": "BOTH",
  "region": "Nashik",
  "preferredCategories": ["MACHINERY", "IRRIGATION"],
  "notifyOptIn": true
}
```

Profile update accepts `fullName`, `region`, `preferredCategories`, `notifyOptIn`, and
`contactVisible`. Phone and role cannot be changed in the MVP.

### Products

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/products` | No | Search/list products |
| `GET` | `/api/products/{id}` | No | Product detail |
| `POST` | `/api/products` | Farmer/Both | Create listing |
| `PUT` | `/api/products/{id}` | Owner | Update listing |
| `DELETE` | `/api/products/{id}` | Owner | Deactivate listing (204) |

Query parameters for `GET /api/products`:

| Parameter | Default | Notes |
| --- | --- | --- |
| `q` | none | Case-insensitive title/description search |
| `category` | none | `MACHINERY`, `TOOLS`, `IRRIGATION`, `SEEDS`, `FERTILIZERS`, `PESTICIDES`, `OTHER` |
| `region` | none | Case-insensitive exact region |
| `available` | `true` | `true` means active and quantity > 0 |
| `page` | `0` | Zero-based page number |
| `size` | `12` | Clamped to 1–50 |
| `sort` | `createdAt,desc` | `createdAt`, `updatedAt`, `price`, `title` plus `asc`/`desc` |

Page shape:

```json
{
  "items": [],
  "page": 0,
  "size": 12,
  "total": 0,
  "totalPages": 0
}
```

Product write payload:

```json
{
  "title": "Mini Tiller 7HP",
  "description": "Well-maintained tiller suitable for small plots.",
  "category": "MACHINERY",
  "price": 45000.00,
  "quantityAvailable": 1,
  "unit": "PIECE",
  "listingStatus": "ACTIVE",
  "language": "en",
  "region": "Nashik",
  "imageUrl": null
}
```

Validation: title 3–140, description 10–2000, non-negative price/quantity, category/unit enums,
`en|hi|mr` language, and region 2–80. `available` is computed, not writable. Only the owner may update
or deactivate. Deactivation sets `INACTIVE`; it does not delete history.

### Search events

`POST /api/search-events` is public so even anonymous failed searches can contribute to demand. The
frontend records a search event when a marketplace search returns no results. This is not a general
analytics firehose.

```json
{
  "query": "mini tiller",
  "category": "MACHINERY",
  "region": "Nashik",
  "language": "en"
}
```

Response:

```json
{
  "id": 7,
  "matched": false,
  "resultCount": 0,
  "message": "Search recorded"
}
```

### Requests

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/requests` | Yes | Create explicit request |
| `GET` | `/api/requests/mine` | Yes | Own requests, newest first |
| `GET` | `/api/requests/{id}` | Yes | Own request, or eligible farmer's related request |

```json
{
  "title": "Mini tiller for a two-acre field",
  "description": "Looking for a used mini tiller in working condition.",
  "category": "MACHINERY",
  "region": "Nashik",
  "quantity": 1,
  "unit": "PIECE",
  "language": "en"
}
```

Status starts as `OPEN`. `FULFILLED` and `CANCELLED` exist in the schema but no mutation endpoint is
exposed in the MVP.

### DemandGap

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/demand/opportunities` | Farmer/Both | Eligible opened opportunities |
| `GET` | `/api/demand/opportunities/{id}` | Farmer/Both | One opportunity |

Optional query: `category` and `minScore`. The list is only for the authenticated farmer's region or
preferred categories. Calling the list may recompute opportunities and create notifications.

```json
[
  {
    "id": 1,
    "title": "Mini tiller for a two-acre field (+2 similar)",
    "category": "MACHINERY",
    "region": "Nashik",
    "score": 59.00,
    "threshold": 30.00,
    "requestCount": 3,
    "distinctRequesters": 3,
    "unmatchedSearches": 2,
    "activeListings": 1,
    "reason": "3 explicit requests from 3 distinct requesters (+60), 2 recent unmatched searches (+4), recency bonus (+5), minus 10 for 1 active listing = 59/100. Opportunity threshold is 30.",
    "status": "OPEN",
    "lastDemandAt": "2026-10-21T09:00:00Z",
    "createdAt": "2026-10-21T10:00:00Z"
  }
]
```

The score is independent of AI. See [demandgap.md](demandgap.md).

### Notifications

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | Yes | Own inbox, newest first |
| `PATCH` | `/api/notifications/{id}/read` | Yes | Mark own notification read |

Types: `DEMAND_OPPORTUNITY`, `REQUEST_MATCH`, `REQUEST_UPDATE`, `SYSTEM`. Related IDs may be null and
point to a product, request, or opportunity. A user can only read or modify their own notifications.

### Contact

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/contact/seller/{productId}` | Yes | Consent-checked contact card |

```json
{
  "productId": 1,
  "sellerId": 1,
  "sellerName": "Ramesh Patil",
  "phone": "9876543210",
  "region": "Nashik",
  "contactVisible": true,
  "consentNote": "The seller has opted in to share this phone number for inquiries about this listing. Use it only for this product and do not redistribute it."
}
```

If consent is absent or the listing is unavailable, `phone` is null and `contactVisible` is false.

### AI proxy

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/ai/health` | Yes | AI/fallback status |
| `POST` | `/api/ai/normalize` | Yes | Normalize a multilingual query |
| `POST` | `/api/ai/match` | Yes | Match query against up to 50 candidates |

The proxy always returns a usable deterministic result if the Python service fails. Direct AI service
endpoints are documented in [ai-matching.md](ai-matching.md).

## Error shape

```json
{
  "code": "VALIDATION_ERROR",
  "message": "The request contains invalid fields",
  "details": [
    { "field": "phone", "message": "must be a 10-digit Indian mobile number" }
  ]
}
```

Representative statuses:

| Status | Code examples | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR`, `INVALID_REQUEST` | Invalid field, enum, parameter, or body |
| 401 | `UNAUTHORIZED`, `INVALID_CREDENTIALS` | Missing/expired token or bad login |
| 403 | `FORBIDDEN` | Role/ownership/eligibility failure |
| 404 | `NOT_FOUND` | Product, request, notification, opportunity |
| 409 | `CONFLICT` | Duplicate phone on registration |
| 500 | `INTERNAL_ERROR` | Unexpected server failure; no stack trace in response |

## Contract fixtures

`contracts/sample-data/` contains deterministic examples used by frontend mocks and AI tests. The AI
fixtures are also executed as tests against the Python service.

## Versioning

The MVP has one unversioned API under `/api`. A production successor should introduce `/api/v1` before
breaking response shapes.
