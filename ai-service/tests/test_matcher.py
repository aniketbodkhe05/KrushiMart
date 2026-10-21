from app.matcher import Candidate, match, match_candidate
from app.normalizer import normalize


def test_confidence_uses_query_terms_strongly_and_title_terms_weakly():
    query = normalize("drip irrigation connector")
    candidate = Candidate(
        product_id=2,
        title="Drip Irrigation Pipe Connector",
        category="IRRIGATION",
    )

    result = match_candidate(query, candidate, threshold=0.60)

    assert result.match is True
    assert result.equivalence == "EQUIVALENT"
    assert result.confidence >= 0.90


def test_irrigation_alone_does_not_match_a_pump():
    query = normalize("drip irrigation connector")
    candidate = Candidate(
        product_id=6,
        title="Borewell Submersible Pump 1HP",
        category="IRRIGATION",
    )

    result = match_candidate(query, candidate, threshold=0.60)

    assert result.match is False
    assert result.equivalence == "UNRELATED"
    assert result.confidence < 0.35


def test_results_are_sorted_by_confidence():
    query, results = match(
        "organic fertilizer",
        [
            Candidate(product_id=3, title="Onion Seeds N-53", category="SEEDS"),
            Candidate(
                product_id=4,
                title="Vermicompost Organic Fertilizer",
                category="FERTILIZERS",
            ),
        ],
    )

    assert query.normalized == "organic fertilizer"
    assert [result.product_id for result in results] == [4, 3]
    assert results[0].match is True
    assert results[1].match is False


def test_description_can_contribute_terms():
    query = normalize("drip connector")
    without_description = Candidate(product_id=2, title="Irrigation Accessory")
    with_description = Candidate(
        product_id=2,
        title="Irrigation Accessory",
        description="Drip connector for a micro irrigation line",
    )

    assert match_candidate(query, with_description).match is True
    assert match_candidate(query, with_description).confidence > match_candidate(
        query, without_description
    ).confidence


def test_empty_query_never_matches():
    query = normalize("the and of")
    candidate = Candidate(product_id=1, title="Mini Tiller 7HP")

    result = match_candidate(query, candidate)

    assert result.match is False
    assert result.confidence == 0.0
