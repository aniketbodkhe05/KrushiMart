from dataclasses import dataclass
from difflib import SequenceMatcher

from .normalizer import Normalization, normalize, tokenize


SIMILARITY_FLOOR = 0.35


@dataclass(frozen=True)
class Candidate:
    product_id: int
    title: str
    category: str | None = None
    description: str | None = None


@dataclass(frozen=True)
class Result:
    product_id: int
    match: bool
    confidence: float
    reason: str
    equivalence: str

    def as_response(self) -> dict:
        return {
            "productId": self.product_id,
            "match": self.match,
            "confidence": self.confidence,
            "reason": self.reason,
            "equivalence": self.equivalence,
        }


def _fuzzy_equal(left: str, right: str) -> bool:
    if left == right:
        return True
    if len(left) < 4 or len(right) < 4:
        return False
    return SequenceMatcher(None, left, right).ratio() >= 0.86


def _overlap(query_tokens: list[str], candidate_tokens: set[str]) -> set[str]:
    matched: set[str] = set()
    for query_token in query_tokens:
        if query_token in candidate_tokens or any(
            _fuzzy_equal(query_token, candidate_token) for candidate_token in candidate_tokens
        ):
            matched.add(query_token)
    return matched


def _candidate_tokens(candidate: Candidate) -> list[str]:
    parts = [
        candidate.title,
        candidate.category or "",
        candidate.description or "",
    ]
    seen: set[str] = set()
    tokens: list[str] = []
    for part in parts:
        for token in tokenize(part):
            if token not in seen:
                seen.add(token)
                tokens.append(token)
    return tokens


def match_candidate(
    query: Normalization,
    candidate: Candidate,
    threshold: float = 0.60,
) -> Result:
    candidate_tokens = _candidate_tokens(candidate)
    candidate_set = set(candidate_tokens)
    query_set = set(query.tokens)

    overlap = _overlap(query.tokens, candidate_set)
    query_coverage = len(overlap) / len(query_set) if query_set else 0.0
    candidate_coverage = len(overlap) / len(candidate_set) if candidate_set else 0.0
    confidence = round(min(1.0, query_coverage * 0.75 + candidate_coverage * 0.25), 3)

    is_match = bool(query_set) and confidence >= threshold
    if is_match:
        equivalence = "EQUIVALENT"
        reason = (
            "The query and listing share the key product terms after multilingual "
            "normalization, so the listing is treated as equivalent."
        )
    elif confidence >= SIMILARITY_FLOOR:
        equivalence = "SIMILAR_NOT_EQUIVALENT"
        reason = (
            "Some product terms overlap, but not enough to treat the listing as the "
            "same product."
        )
    else:
        equivalence = "UNRELATED"
        reason = "No meaningful normalized product-term overlap was found."

    return Result(
        product_id=candidate.product_id,
        match=is_match,
        confidence=confidence,
        reason=reason,
        equivalence=equivalence,
    )


def match(
    query_text: str,
    candidates: list[Candidate],
    threshold: float = 0.60,
) -> tuple[Normalization, list[Result]]:
    query = normalize(query_text)
    results = [match_candidate(query, candidate, threshold) for candidate in candidates]
    results.sort(key=lambda result: (-result.confidence, result.product_id))
    return query, results
