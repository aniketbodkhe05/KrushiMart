# Manual test scenarios

These scenarios complement the automated tests. Run them against a local stack with the `dev`
profile and demo seed. Record actual results rather than assuming they pass.

## Prerequisites

- Backend on `http://localhost:8080` with `SPRING_PROFILES_ACTIVE=dev`.
- Frontend with `VITE_USE_MOCKS=false` on `http://localhost:5173`, or the Docker frontend on `:3000`.
- Optional AI service on `http://localhost:8000`.
- PowerShell examples use `Invoke-RestMethod`.

```powershell
$api = 'http://localhost:8080/api'
```

## 1. Public marketplace

```powershell
$page = Invoke-RestMethod "$api/products?q=tiller&available=true&page=0&size=12"
$page | ConvertTo-Json -Depth 5
```

Expected:

- HTTP 200.
- `items`, `page`, `size`, `total`, `totalPages` exist.
- Only active listings with quantity above zero.
- Search is case-insensitive.
- The sold pump and inactive rotavator are absent when `available=true`.

## 2. Authentication

```powershell
$customerLogin = Invoke-RestMethod -Method Post "$api/auth/login" `
  -ContentType 'application/json' `
  -Body '{"phone":"9876543213","password":"password"}'
$customerHeaders = @{ Authorization = "Bearer $($customerLogin.token)" }

$farmerLogin = Invoke-RestMethod -Method Post "$api/auth/login" `
  -ContentType 'application/json' `
  -Body '{"phone":"9876543210","password":"password"}'
$farmerHeaders = @{ Authorization = "Bearer $($farmerLogin.token)" }
```

Expected:

- Both return `token`, `tokenType: Bearer`, `expiresInMs`, and a public user.
- Passwords are never present in responses.
- Wrong password returns 401 `INVALID_CREDENTIALS`.
- Duplicate registration returns 409.
- Registration with a 7-character password, invalid phone, or unknown role returns 400.

## 3. Role and ownership boundaries

Customer tries to create a listing:

```powershell
try {
  Invoke-RestMethod -Method Post "$api/products" -Headers $customerHeaders `
    -ContentType 'application/json' `
    -Body '{"title":"Test pump","description":"A valid description for testing.","category":"IRRIGATION","price":1000,"quantityAvailable":1,"unit":"PIECE","listingStatus":"ACTIVE","language":"en","region":"Nashik"}'
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected: `403`.

Farmer creates a listing:

```powershell
$listing = Invoke-RestMethod -Method Post "$api/products" -Headers $farmerHeaders `
  -ContentType 'application/json' `
  -Body '{"title":"Test Mini Tiller","description":"A valid description for a test listing.","category":"MACHINERY","price":25000,"quantityAvailable":1,"unit":"PIECE","listingStatus":"ACTIVE","language":"en","region":"Nashik"}'
$listing.id
```

Expected: `201`, `available=true`, seller is the authenticated farmer.

Customer attempts to edit it:

```powershell
try {
  Invoke-RestMethod -Method Put "$api/products/$($listing.id)" -Headers $customerHeaders `
    -ContentType 'application/json' `
    -Body '{"title":"Stolen edit","description":"The customer should not be able to do this.","category":"MACHINERY","price":1,"quantityAvailable":1,"unit":"PIECE","listingStatus":"ACTIVE","language":"en","region":"Nashik"}'
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected: `403` (method security runs before ownership). Another farmer would get ownership 403.

## 4. Explicit request

```powershell
$request = Invoke-RestMethod -Method Post "$api/requests" -Headers $customerHeaders `
  -ContentType 'application/json' `
  -Body '{"title":"Mini tiller for manual test","description":"Need a working mini tiller in Nashik.","category":"MACHINERY","region":"Nashik","quantity":1,"unit":"PIECE","language":"en"}'

Invoke-RestMethod "$api/requests/mine" -Headers $customerHeaders | ConvertTo-Json -Depth 4
```

Expected:

- `201`, status `OPEN`.
- It appears in `mine`.
- It does not appear in another user's `mine`.
- Quantity zero or an unknown category returns 400.

## 5. DemandGap qualification and eligibility

Using the farmer token:

```powershell
Invoke-RestMethod "$api/demand/opportunities" -Headers $farmerHeaders | ConvertTo-Json -Depth 6
```

Expected:

- HTTP 200.
- Nashik machinery opportunity is present if seeded requests are inside the 30-day window.
- Each item includes counts, score, threshold, status, and a reason.
- The score is at least 30 and request count is greater than zero.
- Items are filtered to the farmer's region or preferred categories.

Customer token:

```powershell
try {
  Invoke-RestMethod "$api/demand/opportunities" -Headers $customerHeaders
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected: `403`.

To verify expiry, submit a fresh qualified bucket, then manipulate/seed data so the only requests are
older than 30 days (or fewer than needed), refresh, and confirm the opportunity becomes `EXPIRED`.
Automated `DemandGapIntegrationTest` covers the core path without manual clock manipulation.

## 6. Contact consent

Default approval:

```powershell
Invoke-RestMethod "$api/contact/seller/1" -Headers $customerHeaders | ConvertTo-Json
```

Expected for seeded available product 1: `contactVisible=true`, phone present, consent note present.

Revoke consent:

```powershell
Invoke-RestMethod -Method Put "$api/users/me" -Headers $farmerHeaders `
  -ContentType 'application/json' `
  -Body '{"fullName":"Ramesh Patil","region":"Nashik","preferredCategories":["MACHINERY","TOOLS","IRRIGATION"],"notifyOptIn":true,"contactVisible":false}'

Invoke-RestMethod "$api/contact/seller/1" -Headers $customerHeaders | ConvertTo-Json
```

Expected: `contactVisible=false`, `phone=null`, explanatory note. Restore consent afterward.

Also deactivate the product and verify contact is hidden even if consent is true.

## 7. Notifications

```powershell
$inbox = Invoke-RestMethod "$api/notifications" -Headers $farmerHeaders
$firstUnread = $inbox | Where-Object { -not $_.read } | Select-Object -First 1

Invoke-RestMethod -Method Patch "$api/notifications/$($firstUnread.id)/read" -Headers $farmerHeaders
```

Expected:

- Only the current user's notifications are returned.
- Marking read returns `read=true`.
- Marking another user's notification returns 404.
- Demand and request-match notifications are not duplicated on repeated feed requests.

## 8. AI availability and fallback

With AI running:

```powershell
Invoke-RestMethod "$api/ai/health" -Headers $farmerHeaders | ConvertTo-Json
Invoke-RestMethod -Method Post "$api/ai/match" -Headers $farmerHeaders `
  -ContentType 'application/json' `
  -Body '{"query":"mini tillar","candidates":[{"productId":1,"title":"Mini Tiller 7HP","category":"MACHINERY"},{"productId":8,"title":"Rotavator 5 Feet","category":"MACHINERY"}],"threshold":0.6}' | ConvertTo-Json -Depth 5
```

Expected: health `provider` reflects the Python service; match finds product 1.

Stop the AI service and repeat:

Expected: health returns 200 with `status=degraded`, `provider=fallback`; `/ai/match` still returns a
usable fallback result. Marketplace search and DemandGap remain unaffected.

## 9. Frontend mock flow

Set `VITE_USE_MOCKS=true` (or leave unset), then:

1. Open `/marketplace` and search `tiller`.
2. Open a product; verify contact requires login.
3. Click customer demo sign-in (`9876543213`).
4. Submit a request from `/requests/new`; verify the success screen and My Requests.
5. Sign out and sign in as farmer `9876543210`.
6. Open `/demandgap`; verify a qualified card, counts, score meter, and reason.
7. Open `/notifications`; mark one read and verify the navbar badge decreases.
8. Open a consenting product and the contact page; verify the demo phone is shown.
9. Open `/profile`; toggle notifications off, save, and verify the saved state.
10. Clear site data and reload to restore seed mocks.

Expected: no console errors; routes redirect correctly when logged out; empty/error states are usable.

## 10. Validation and error UI

- Submit registration with an invalid phone and short password: inline errors, no request sent.
- Submit a request with quantity 0: inline error.
- Open a nonexistent product `/products/999999`: error state, no crash.
- Open an unknown route: 404 page with links.
- Expire/clear the token and call a protected page: redirect to login with a working return path.

## 11. Responsive and content checks

At 375px, 768px, and 1280px widths:

- Navigation collapses without horizontal scrolling.
- Product cards and filters remain usable.
- Modals/confirm dialogs fit and remain keyboard reachable.
- Long descriptions and titles wrap rather than overflow.
- DemandGap score, counts, and explanation are readable.

## Cleanup

Deactivate or delete test listings via the UI/API, restore consent, and reseed the demo database before
a presentation:

```powershell
docker compose down -v
docker compose up --build
```
