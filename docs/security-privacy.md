# Security and privacy

This document describes what the MVP does, and what it does not do. The implementation is suitable
for a local demo and course project, not for handling real personal data without hardening.

## Authentication

- Registration and login use phone number plus password.
- Passwords are hashed with Spring Security `BCryptPasswordEncoder`; plaintext passwords are never
  stored.
- Login errors are intentionally generic: "Phone number or password is incorrect".
- Successful auth returns a signed HMAC JWT with subject equal to the user ID and a 24-hour default
  expiry.
- The SPA sends `Authorization: Bearer <jwt>` on protected requests.
- No API session, cookie, or server-side token store is used.
- There is no phone verification, password reset, refresh token, or token revocation in the MVP.

### Known token limitations

- The JWT is stored in browser `localStorage`, so any XSS can read it.
- Logout deletes the local token but cannot invalidate an already copied token.
- Rotating `JWT_SECRET` invalidates all tokens, which is the only global revocation mechanism.
- There is no per-device session list.

Production should consider short-lived access tokens, rotating refresh tokens in `HttpOnly` cookies,
CSRF protection appropriate to cookies, and a revocation strategy.

## Authorization

- Spring Security requires authentication for all routes except:
  - `/api/auth/**`
  - `GET /api/products/**`
  - `POST /api/search-events`
  - Swagger/OpenAPI paths
  - `/error` and `/actuator/health`
- Method security restricts product create/update/delete to `FARMER` or `BOTH`.
- Product update/deactivate also checks ownership in the service.
- DemandGap list/detail requires a seller role and filters by region/category eligibility.
- "My requests" is scoped to the authenticated requester. Request detail is available to its owner
  or an eligible farmer; other users receive 403.
- Notifications are looked up by both ID and current user ID, preventing cross-user access.
- Contact cards apply seller consent and listing availability checks server-side.

UI visibility is not treated as authorization. Direct API calls are tested against these rules.

## Contact consent

A seller can disable `contactVisible` in their profile. Contact is returned only when all are true:

1. The listing is currently available.
2. The seller has `contactVisible = true`.
3. The requester is authenticated.

Otherwise `phone` is null. Demo customer accounts default to `contactVisible = false`, and the seed
does not expose customer phone numbers as seller contacts. The consent note is shown in the UI and
warns against redistributing the number.

## Privacy of demand data

- DemandGap exposes category, approximate region, counts, score, and reason.
- Exact addresses, coordinates, individual search histories, and requester identities are not exposed
  in opportunity responses.
- Anonymous search events are supported but still aggregated at category/region level.
- Search events record query text. A production deployment should define retention and deletion
  policies; the MVP does not purge old events.
- Notifications link to related entities but are visible only to their owner.

The system does not attempt to infer sensitive traits, prices, or personal circumstances.

## Input validation and errors

- Jakarta Bean Validation enforces string lengths, enums, phone patterns, positive quantities, and
  price bounds.
- Product IDs are numeric path variables; invalid types become 400 responses.
- Uploaded files are not supported; an image is an optional URL, so there is no multipart file upload
  attack surface in the MVP.
- Unexpected exceptions produce a generic `INTERNAL_ERROR` without stack traces.
- The error contract is stable and does not echo passwords or tokens.

## CORS and headers

- The backend allows origins from `CORS_ALLOWED_ORIGINS` only, defaulting to local Vite ports.
- Allowed methods and headers are explicit.
- CSRF is disabled because the API is stateless and uses bearer tokens rather than cookies.
- The production Nginx configuration adds `X-Content-Type-Options`, `X-Frame-Options`, and a
  referrer policy. It does not currently add a full Content Security Policy.

## Secrets and configuration

- `.env.example` contains development-only placeholders and should not be used as a real secret file.
- `.env` and build artifacts are ignored by Git.
- `JWT_SECRET`, database passwords, and any future provider keys must be supplied through environment
  variables or a secret manager.
- The default JWT secret is public in the repository and must be changed before any shared deployment.

## Demo data warning

The `dev` profile loads known accounts with password `password` and public-looking phone numbers.
Run without the dev profile and without `db/seed` for any non-demo environment.

The frontend mock mode is not a security implementation. It keeps demo users, including passwords,
in browser `localStorage` and uses fake tokens. Use it only with the seeded demo accounts, never with
a real password or real personal data.

## Abuse and operational gaps

Not implemented:

- Rate limiting or CAPTCHA.
- Account lockout after failed logins.
- Phone OTP verification.
- Content moderation or image validation.
- Audit log of administrative or sensitive access.
- WAF, bot protection, or DDoS mitigation.
- Encryption at rest beyond the database/provider defaults.
- Automated dependency and container scanning.

The Nginx proxy has connection/read timeouts, but that is not a substitute for rate limiting.

## Dependency posture

At install time npm reported 11 vulnerabilities in the dependency tree (5 moderate, 6 high), mostly
from development tooling/transitive packages. This was not auto-fixed with a breaking `npm audit fix
--force`. Review and upgrade deliberately before production. The Python and Maven dependencies were
not audited with external scanners in this environment.

## Reporting

For a real deployment, define a security contact, a disclosure process, log retention rules, and a
data deletion request process before collecting genuine farmer data.
