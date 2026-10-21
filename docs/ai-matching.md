# AI matching service

The AI service is an optional Python sidecar that normalizes multilingual agricultural product
queries and matches them against listing candidates. It is not used for DemandGap scoring, pricing,
or authorization.

## Design constraints

- No paid API key, downloaded model, GPU, or internet dependency.
- Deterministic output for the same input.
- Short timeouts on the Java side.
- An invalid or failed AI response must never break marketplace search.
- Java owns the final validation of candidate IDs and confidence ranges.

The service therefore uses transparent multilingual phrase mapping, token normalization, and token
coverage rather than an opaque language model.

## Runtime

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Docs: `http://localhost:8000/docs`.

Environment:

| Variable | Default | Meaning |
| --- | --- | --- |
| `AI_SERVICE_URL` (backend) | `http://localhost:8000` | Base URL used by `AiClient` |
| `AI_SERVICE_ENABLED` (backend) | `true` | Set `false` to skip network attempts |
| `AI_MATCH_THRESHOLD` | `0.60` | Shared documented default; request body can override |

The AI service itself does not require the backend.

## Endpoints

The backend calls these root paths directly:

### `GET /health`

```json
{
  "status": "ok",
  "provider": "heuristic",
  "aiAvailable": true,
  "fallbackAvailable": true,
  "detail": "Heuristic multilingual matching service is ready. No external model or API key is required."
}
```

The public backend proxy is `GET /api/ai/health` and requires a JWT. If the Python service is
unreachable, the proxy reports `status: degraded`, `provider: fallback`, and still returns 200.

### `POST /normalize`

```json
{ "text": "ठिबक सिंचन जोड" }
```

```json
{
  "original": "ठिबक सिंचन जोड",
  "normalized": "drip irrigation connector",
  "tokens": ["drip", "irrigation", "connector"],
  "languageGuess": "mr",
  "normalizedBy": "ai"
}
```

`languageGuess` is one of `en`, `hi`, `mr`, or `unknown`. Devanagari text is distinguished with
Marathi markers; otherwise it is treated as Hindi. The field is a hint, not a claim of high-accuracy
language identification.

### `POST /match`

```json
{
  "query": "mini tillar",
  "candidates": [
    { "productId": 1, "title": "Mini Tiller 7HP", "category": "MACHINERY" },
    { "productId": 8, "title": "Rotavator 5 Feet", "category": "MACHINERY" }
  ],
  "threshold": 0.6
}
```

```json
{
  "queryNormalized": "mini tiller",
  "matches": [
    {
      "productId": 1,
      "match": true,
      "confidence": 0.875,
      "reason": "The query and listing share the key product terms after multilingual normalization, so the listing is treated as equivalent.",
      "equivalence": "EQUIVALENT"
    },
    {
      "productId": 8,
      "match": false,
      "confidence": 0.0,
      "reason": "No meaningful normalized product-term overlap was found.",
      "equivalence": "UNRELATED"
    }
  ],
  "provider": "ai"
}
```

Limits: query 1–300 characters, 1–50 candidates, threshold 0–1. Results are sorted by descending
confidence. `equivalence` is:

- `EQUIVALENT` when confidence is at least the threshold.
- `SIMILAR_NOT_EQUIVALENT` when confidence is between 0.35 and the threshold.
- `UNRELATED` below 0.35.

## Normalization approach

1. Case-fold text.
2. Replace known phrases first (longest phrase wins), for example:
   - `ठिबक सिंचन जोड` → `drip irrigation connector`
   - `जैविक खाद` → `organic fertilizer`
   - `thibak sinchan jod` → `drip irrigation connector`
   - `mini tillar` → `mini tiller`
3. Tokenize Unicode letters/numbers.
4. Map Hindi/Marathi and Romanized agricultural synonyms to canonical English terms.
5. Remove English stop words.
6. Apply simple plural normalization.
7. Deduplicate while preserving order.

The vocabulary intentionally covers the demo categories and fixtures; it is not a general-purpose
translation system. Extend `PHRASES` and `TOKEN_SYNONYMS` when adding a new supported term.

## Confidence

Candidate text is the title, category, and optional description. Token overlap is computed with a
small fuzzy tolerance for spelling variation.

```text
queryCoverage     = matched query tokens / query tokens
candidateCoverage = matched query tokens / candidate tokens
confidence        = min(1, 0.75 * queryCoverage + 0.25 * candidateCoverage)
```

Query coverage dominates so that a long listing description cannot manufacture a match. A pump and a
connector share only the category term `irrigation`, producing low confidence and no match.

These values are heuristic scores, not calibrated probabilities.

## Java integration

`AiClient` uses `RestClient` with a 1.5-second connect timeout and 4-second read timeout. For
`/match`, `MatchingService`:

1. Calls Python.
2. Rejects null responses or empty match lists.
3. Drops results whose product ID is not in the request.
4. Drops confidence values outside 0–1.
5. Forces the response provider to `ai`.
6. Falls back to `FallbackMatchingService` if nothing valid remains or any exception occurs.

The Java fallback normalizes English/Hindi/Marathi phrases with the same idea and scores token
overlap. Its output provider is `fallback`.

## Fallback behavior

| Failure | User-visible effect |
| --- | --- |
| Service disabled | Deterministic Java matching |
| Connection refused/timeout | Deterministic Java matching |
| 5xx from Python | Deterministic Java matching |
| Invalid candidate IDs/confidence | Deterministic Java matching |
| Empty match list | Deterministic Java matching |

Marketplace listing, requests, DemandGap, and notifications do not depend on the AI service at all.

## Tests

From `ai-service/`:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Verified result: **26 passed**, with one third-party Starlette deprecation warning on Python 3.13.

Coverage includes:

- All four shared fixtures in `contracts/sample-data/ai-match-cases.json`.
- Marathi, Hindi, Romanized, and misspelled queries.
- Language hints and token deduplication.
- Negative pump/connector matching.
- Confidence ordering, description contribution, and empty queries.
- FastAPI health/normalize/match contracts.
- Validation failures for empty candidates, bad threshold, and missing fields.
- Root endpoint description.

## Limitations and production path

- Vocabulary-based, not semantic; unseen crop names may need explicit mappings.
- No transliteration library; Romanized variants are manually listed.
- Confidence is not calibrated and should not be shown as a probability.
- A production version could add a reviewed embedding index, cached model warmup, observability, and
  dataset-based evaluation, while retaining Java validation and deterministic fallback.
