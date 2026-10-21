# Team work plan

The repository is structured so five people can work in parallel without all editing the same files.
The MVP deadline assumed here is 29 October 2026, with integration earlier in the week.

## Workstreams

| Stream | Owner focus | Primary paths | Depends on |
| --- | --- | --- | --- |
| A. Frontend product | Pages, routing, responsive UI, mock flows | `frontend/src/features`, `components`, `app` | API contract |
| B. Backend core | Auth, users, products, requests, contact | `backend/.../auth`, `user`, `product`, `request`, `contact` | Schema/contract |
| C. Demand and notifications | Scoring, aggregation, alerts | `backend/.../demandgap`, `notification`, related tests | Products/requests |
| D. AI and contracts | OpenAPI, fixtures, FastAPI, fallback validation | `contracts`, `ai-service`, `backend/.../matching` | Contract |
| E. QA and delivery | Tests, docs, deploy, demo rehearsal | `docs`, `tests`, `deployment`, `README.md` | All |

Adjust names locally. Do not assign two people to the same package without agreeing on file ownership.

## Interfaces to freeze first

1. Enums: categories, units, roles, listing status, request status, notification types.
2. `ApiError`, page response, auth response, product/request/opportunity shapes.
3. Endpoint paths and role matrix.
4. The DemandGap score formula and threshold.
5. Mock/real service function signatures in `frontend/src/services`.

`contracts/openapi.yaml` and `frontend/src/lib/constants.js` are the shared reference points. Any change
to enums or response shape must be announced and updated in all three layers.

## Suggested schedule

### Day 1: contract and skeleton

- D publishes OpenAPI, schemas, fixtures.
- B confirms schema and auth approach.
- A creates the app shell, design tokens, and routing plan.
- C documents scoring and notification rules.
- E sets up README, test commands, and issue board.

Exit: everybody can name the same endpoint, enum values, and demo accounts.

### Day 2: core vertical slice

- B completes register/login/JWT, product list/detail/create.
- A builds home, marketplace, login, and mock products.
- C implements scoring service with unit tests.
- D implements AI normalization and contract fixtures.
- E writes API smoke scenarios.

Exit: public search and an authenticated listing work independently in mock and API modes.

### Day 3: requests and ownership

- B completes requests/profile/ownership checks.
- A completes product form, detail, request form, my requests.
- C implements DemandGap aggregation and expiry.
- D integrates AI fallback and validates it.
- E tests role boundaries.

Exit: a customer can request; a farmer can list; non-owners are blocked.

### Day 4: DemandGap and notifications

- C finishes notification deduplication, eligibility, and farmer feed.
- A completes DemandGap and notification pages.
- B adds contact consent.
- D adds request-match fallback checks.
- E tests the full Nashik demand story.

Exit: explicit requests produce a qualified opportunity and an eligible farmer notification.

### Day 5: integration

- A switches mock mode off and fixes real API mismatches.
- B fixes CORS, error mapping, and seed behavior.
- C verifies duplicate refresh behavior.
- D verifies AI-down fallback.
- E runs all automated tests and records failures.

Exit: frontend works against the real backend in a local PostgreSQL environment.

### Day 6: hardening

- Add missing tests and validation.
- Fix mobile layouts and empty/error states.
- Verify contact consent both ways.
- Run dependency audits and container build (on a Docker machine).
- Update documentation with actual commands/results.

### Day 7: demo prep

- Seed a clean demo database.
- Rehearse the customer → farmer → customer story.
- Prepare fallback screenshots if internet/Docker fails.
- Freeze code except blocker fixes.
- Final lint/test/build run.

### Day 8: buffer

- Only critical fixes.
- Tag the submission.
- Verify README instructions from a clean environment if possible.

## Branch and PR workflow

- `main` stays runnable.
- Use short branches: `feat/frontend-marketplace`, `feat/demand-scoring`, `fix/contact-consent`.
- PRs should state which contract changed and include test commands/results.
- Keep PRs small; do not mix formatting-only changes with behavior.
- Resolve conflicts in constants and OpenAPI immediately; they block everyone.
- At least one reviewer outside the owning stream for contract/security changes.

Example commit style:

```text
feat(demandgap): require explicit requests before qualifying
fix(frontend): preserve login redirect path
docs(api): document contact consent response
```

## Definition of done

A feature is done when:

- API contract and implementation agree.
- Authorization is enforced server-side.
- Loading, empty, error, and success states exist in the UI.
- Relevant tests pass; lint/build pass.
- Docs mention any new env var, endpoint, or limitation.
- No secrets or real personal data are committed.
- A teammate can run it from the README without asking the author.

## Handoffs

### Contract owner → everyone

Provide endpoint path, role, request JSON, success status, error codes, and at least one sample record.
Update fixtures when adding a category or enum.

### Backend → frontend

Announce the actual response shape, not only the desired shape. Provide a working demo login and seed
records. Keep mock responses aligned until real integration is verified.

### QA → owners

Report reproduction path, expected result, actual result, and whether it occurs in mock mode, real API,
or both. Distinguish missing features from regressions.

## Demo ownership

- Presenter: runs the customer → farmer → customer story.
- Backend operator: watches API logs, can restart services.
- Frontend operator: has a mock-mode tab ready if the API fails.
- QA: holds the expected outcomes and fallback screenshots.
- Timekeeper: keeps the demo under the allotted time and stops scope creep.

## Risks

| Risk | Mitigation |
| --- | --- |
| API shape drift | Contract-first changes, fixtures, integration day |
| Docker unavailable | Local frontend mock demo + documented non-Docker path |
| AI unavailable | Deterministic Java/Python fallback; never block core flow |
| Seed timestamps age out | Backend seed uses relative times; reseed before demo. Mock seed is fixed to October 2026 and needs updated dates for a later demo. |
| Too many demo steps | Rehearse a five-minute path and keep a backup tab |
| Last-minute scope creep | Non-goals list; freeze after day 7 |
