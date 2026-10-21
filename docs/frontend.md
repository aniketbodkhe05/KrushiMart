# Frontend guide

React 18 + Vite 5 single-page application. All source is JavaScript/JSX; TypeScript is intentionally
not used.

## Commands

```powershell
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run lint
npm run build
npm run preview
```

## Configuration

Vite reads environment variables at build time:

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_USE_MOCKS` | `true` | Anything except the literal string `false` enables mock mode |
| `VITE_API_BASE_URL` | `/api` | Axios base URL |

Mock mode exists so the team can demo without PostgreSQL/backend. It is intentionally the default to
avoid a broken first-run experience.

Create `frontend/.env` for full-stack use:

```dotenv
VITE_USE_MOCKS=false
VITE_API_BASE_URL=/api
```

Vite proxies `/api` to `http://localhost:8080` during development.

## Routes

| Path | Access | Page |
| --- | --- | --- |
| `/` | Public | Home |
| `/marketplace` | Public | Search, filters, pagination |
| `/products/:id` | Public | Product detail |
| `/products/new` | Farmer/Both | Create listing |
| `/products/:id/edit` | Farmer/Both + owner check | Edit listing |
| `/requests/new` | Authenticated | Submit explicit request |
| `/requests` | Authenticated | My requests |
| `/demandgap` | Farmer/Both | Qualified opportunities |
| `/notifications` | Authenticated | Inbox |
| `/contact/:productId` | Authenticated | Consent-gated seller contact |
| `/profile` | Authenticated | Profile and preferences |
| `/login`, `/register` | Public | Auth |
| `*` | Public | Not found |

Protected routes redirect unauthenticated users to `/login?redirect=<original-path>`. Login accepts
only relative redirect paths beginning with a single `/`, preventing an open redirect.

## Structure

```text
src/
  app/            providers and router
  components/
    layout/       AppLayout, Navbar, Footer, DemoBanner
    common/       cards, badges, headers, route guard, categories
    feedback/     loading, error, empty, access denied, toasts
    forms/        accessible form controls
    ui/           Button, Card, Badge, Modal, Spinner
  features/
    auth/
    home/
    marketplace/
    products/
    requests/
    demandgap/
    notifications/
    contact/
    farmer-profile/
    not-found/
  hooks/          useApi, useAuth, useToast
  lib/            constants and localStorage helpers
  mocks/          in-browser implementation of every service
  services/       the only HTTP/mock switch layer
  utils/          formatting helpers
```

Feature pages live under `features/<feature>/pages`. Shared components stay generic; domain labels
and enums live in `lib/constants.js`.

## Data layer

`services/api-client.js` creates Axios with a 10-second timeout, adds the bearer token, and dispatches
`krushimart:unauthorized` on 401 responses outside auth endpoints. `AuthProvider` listens and clears
the session.

Each service exposes async functions and branches on `USE_MOCKS`:

- `auth.api.js`
- `products.api.js`
- `requests.api.js`
- `demandgap.api.js`
- `notifications.api.js`
- `contact.api.js`
- `search.api.js`
- `ai.api.js`

Mock modules mirror the backend response shapes and sustain data in `localStorage`. Listings,
requests, DemandGap calculation, profile updates, contact consent, and notification read state work
offline. Notifications start from the seeded inbox; unlike the backend, the mock does not generate
new request-match or demand notifications when a listing or request is created.

Mock storage keys are versioned (`krushimart.mock.*.v1`) so schema changes can be reset by changing
the key. Clearing site data restores the initial demo state.

## Async UI state

`useApi(loader, deps)` returns `{ data, loading, error, reload }` and ignores stale resolutions after
unmount/dependency changes. Pages use shared `LoadingState`, `ErrorState`, and `EmptyState` components
instead of bespoke spinners.

Mutating actions manage their own submission state and show toast feedback through `useToast`.
User-facing errors go through `getErrorMessage`, which understands the backend `ApiError` shape and
falls back to Axios/Error messages.

## Auth state

`AuthProvider` provides:

- `user`, `loading`, `isAuthenticated`
- `canSell` (`FARMER` or `BOTH`)
- `login`, `register`, `logout`, `updateProfile`

Session storage is a small helper around `localStorage` for token and public user snapshot. The real
API never sends passwords, and the frontend does not store them for backend sessions. Mock mode is
different: its demo-only user store keeps passwords in `localStorage` so registration and login can
work without a server. Never use mock mode with real credentials.

## UX conventions

- Mobile-first Tailwind layouts; navigation collapses under `lg`.
- Farmer-only links are hidden for customers, while routes still enforce access.
- Product availability, request status, and notification type use consistent badges.
- DemandGap score uses `ScoreMeter` with the shared threshold and a collapsible reason.
- Empty states explain the next action rather than only saying "no data".
- Contact screens explicitly state that payment/chat protection does not exist.
- Forms use labels, required markers, inline errors, and `aria-invalid`.

## Design tokens

`tailwind.config.js` defines the leaf (green), harvest (amber), and stone palette used across screens.
Shared primitives in `components/ui` keep radius, shadow, and focus styles consistent. Do not add a
second component library without a team decision.

## Build and lint

`npm run build` produces `dist/` with Vite. The last verified build succeeded with 400.97 kB JS
(121.63 kB gzip). Fonts are not downloaded; the design relies on system UI fonts.

`npm run lint` uses ESLint 9 flat config with recommended JS, React Hooks, and React Refresh rules.
Run it before committing. The last verified run reported 0 errors and 0 warnings; see
[testing.md](testing.md) for the full verification record.

## Accessibility notes

- Semantic headings and form labels are present.
- Icon-only buttons have `aria-label`.
- Score meter has `role="meter"` and aria values.
- Focus styles use visible outlines.
- Color is not the only indicator for unread/status in most places, but a dedicated screen-reader
  audit was not performed.
- Modal focus trapping and full keyboard restoration should be reviewed before production.

## Known limitations

- No automated frontend unit/component tests or browser E2E suite yet.
- Mock demo records use fixed October 2026 timestamps. DemandGap seeds expire from the 30-day window
  after November 2026; update the mock dates or generate relative seed times before a later demo.
- Mock and real API can drift; contract fixtures and backend tests are the guardrail.
- Image URLs are rendered directly; there is no upload, resize, or moderation.
- No internationalization framework; UI is English with multilingual content labels.
- No service worker/offline app shell.
