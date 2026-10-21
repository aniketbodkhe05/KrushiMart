import json
from pathlib import Path

import pytest

from app.matcher import Candidate, match


CASES_PATH = Path(__file__).resolve().parents[2] / "contracts" / "sample-data" / "ai-match-cases.json"


def load_cases():
    with CASES_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)["cases"]


@pytest.mark.parametrize("case", load_cases(), ids=lambda case: case["name"])
def test_contract_fixture_matches(case):
    candidates = [
        Candidate(
            product_id=candidate["productId"],
            title=candidate["title"],
            category=candidate.get("category"),
            description=candidate.get("description"),
        )
        for candidate in case["candidates"]
    ]

    query, results = match(case["query"], candidates, threshold=0.60)
    matched_ids = [result.product_id for result in results if result.match]

    assert query.normalized
    assert matched_ids == case["expectedMatchProductIds"]


def test_contract_fixture_negative_confidence_is_below_threshold():
    case = next(case for case in load_cases() if case["expectedMatchProductIds"] == [])
    candidate = Candidate(
        product_id=case["candidates"][0]["productId"],
        title=case["candidates"][0]["title"],
        category=case["candidates"][0].get("category"),
    )

    _, results = match(case["query"], [candidate], threshold=0.60)

    assert len(results) == 1
    assert results[0].match is False
    assert results[0].confidence < 0.60
    assert results[0].equivalence in {"SIMILAR_NOT_EQUIVALENT", "UNRELATED"}
