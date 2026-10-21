# DemandGap scoring

DemandGap answers a narrow question: *in this category and approximate region, is explicit demand
materially larger than current supply?* It is not a forecast, a price recommendation, or an AI
inference.

## Inputs

Only two demand sources are considered, both inside a rolling **30-day** window:

1. `OPEN` product requests.
2. Unmatched search events that have both a category and a region.

Matched searches are excluded: the marketplace already served that need. Searches missing category or
region cannot be aggregated safely and are ignored. Duplicate searches by one user are collapsed by
user + normalized query; anonymous searches are collapsed by query + date.

Active supply is the count of listings in the same category and region that are:

- `listing_status = ACTIVE`, and
- `quantity_available > 0`.

## Formula

Let:

- `R` = number of explicit requests, capped at 10
- `D` = number of distinct requesters, capped at 10
- `S` = number of unmatched search keys, capped at 10
- `B` = recency bonus: 5 if last demand was within 7 days, 2 if within 30 days, 0 otherwise
- `L` = active supply listings
- `P` = supply penalty = `min(L * 10, 40)`

Then:

```text
raw   = R*8 + D*12 + S*2 + B
score = clamp(raw - P, 0, 100)
```

A bucket qualifies only when:

```text
score >= 30 AND R > 0
```

The explicit-request requirement is absolute. Search-only buckets never produce an opportunity, even
if their calculated score is high.

## Worked example

Nashik machinery:

- 3 open requests from 3 distinct customers
- 2 recent unmatched search keys
- last demand 2 days ago
- 1 active mini-tiller listing

```text
request points   = min(3,10) * 8  = 24
requester points = min(3,10) * 12 = 36
search points    = min(2,10) * 2  = 4
recency bonus                     = 5
supply penalty   = min(1*10,40)   = 10

score = 24 + 36 + 4 + 5 - 10 = 59
```

The bucket qualifies because `59 >= 30` and there is at least one explicit request. The UI displays
the same reason string produced by the backend.

## Suppression and expiry

During a refresh:

- Existing opportunity for a qualified bucket is updated.
- A bucket that no longer qualifies causes its existing `OPEN` opportunity to become `EXPIRED`.
- Previously open opportunities whose bucket no longer exists also expire.
- Expired rows remain for history but are excluded from the farmer feed.

The unique `(category, region)` constraint guarantees one current row per bucket.

## Farmer eligibility

A farmer sees an opportunity when:

- the account role is `FARMER` or `BOTH`;
- `notifyOptIn = true` for notification creation; and
- the farmer's region matches the opportunity region **or** their preferred categories include the
  opportunity category.

Customers and anonymous users cannot call the feed. The list endpoint filters server-side; hiding it
in the UI is not the authorization boundary.

## Notifications

When an opportunity qualifies, opted-in eligible farmers receive a `DEMAND_OPPORTUNITY` notification.
The service stops after 20 farmers per opportunity and checks whether that farmer already has a
notification for the opportunity, avoiding duplicate spam.

Notifications are generated when the authenticated farmer feed is refreshed. There is no cron or
background worker in the MVP. This is a deliberate simplification; production would schedule refresh
and notification work.

## Privacy properties

- Only category and approximate region are exposed, not street addresses or coordinates.
- Individual search histories are not shown. Search events are collapsed into counts.
- A requester's identity is not included in an opportunity response.
- Contact details remain controlled by seller consent and are separate from DemandGap.
- Scores and reasons are stored and reproducible from the recorded counts.

## Why not AI?

A model would make notification decisions harder to explain, can behave inconsistently as prompts or
providers change, and adds an outage dependency to a core workflow. AI is used only as an optional
normalizer/matcher for product text. Demand qualification stays rule-based.

## Configuration constants

| Constant | Value | Location |
| --- | --- | --- |
| Window | 30 days | `DemandScoringService.WINDOW_DAYS` |
| Threshold | 30 | `DemandScoringService.THRESHOLD` |
| Request cap | 10 | `DemandScoringService.calculate` |
| Requester cap | 10 | `DemandScoringService.calculate` |
| Search cap | 10 | `DemandScoringService.calculate` |
| Supply penalty cap | 40 | `DemandScoringService.calculate` |
| Max notified farmers | 20 | `DemandGapService` |

Changing these requires updating tests and the documentation together.

## Test coverage

`DemandScoringServiceTest` covers boundaries: no requests, score floor/ceiling, threshold, recency,
and supply penalties. `DemandGapIntegrationTest` exercises duplicate suppression, qualification,
farmer notification, and request-match notification after creating a listing.

The AI fixtures in `contracts/sample-data/ai-match-cases.json` are unrelated to demand scoring and
never affect these numbers.
