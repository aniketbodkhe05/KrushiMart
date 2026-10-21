from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

from . import __version__
from .matcher import Candidate, match
from .normalizer import normalize


class NormalizeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    text: str = Field(min_length=1, max_length=300)


class NormalizeResponse(BaseModel):
    original: str
    normalized: str
    tokens: list[str]
    languageGuess: str
    normalizedBy: Literal["ai", "fallback"] = "ai"


class MatchCandidate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    productId: int
    title: str = Field(min_length=1, max_length=200)
    category: str | None = None
    description: str | None = Field(default=None, max_length=2000)


class MatchRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    query: str = Field(min_length=1, max_length=300)
    candidates: list[MatchCandidate] = Field(min_length=1, max_length=50)
    threshold: float = Field(default=0.60, ge=0.0, le=1.0)


class MatchResult(BaseModel):
    productId: int
    match: bool
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    equivalence: Literal["EQUIVALENT", "SIMILAR_NOT_EQUIVALENT", "UNRELATED"]


class MatchResponse(BaseModel):
    queryNormalized: str
    matches: list[MatchResult]
    provider: Literal["ai", "fallback"] = "ai"


class HealthResponse(BaseModel):
    status: str
    provider: str
    aiAvailable: bool
    fallbackAvailable: bool
    detail: str


app = FastAPI(
    title="KrushiMart Matching Service",
    version=__version__,
    description=(
        "Optional multilingual normalization and matching service. It is "
        "deterministic, offline, and has no API-key or model-download requirement."
    ),
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        provider="heuristic",
        aiAvailable=True,
        fallbackAvailable=True,
        detail=(
            "Heuristic multilingual matching service is ready. No external model "
            "or API key is required."
        ),
    )


@app.post("/normalize", response_model=NormalizeResponse)
def normalize_query(request: NormalizeRequest) -> NormalizeResponse:
    result = normalize(request.text)
    return NormalizeResponse(**result.as_response())


@app.post("/match", response_model=MatchResponse)
def match_query(request: MatchRequest) -> MatchResponse:
    candidates = [
        Candidate(
            product_id=candidate.productId,
            title=candidate.title,
            category=candidate.category,
            description=candidate.description,
        )
        for candidate in request.candidates
    ]
    query, results = match(request.query, candidates, request.threshold)
    return MatchResponse(
        queryNormalized=query.normalized,
        matches=[MatchResult(**result.as_response()) for result in results],
        provider="ai",
    )


@app.get("/")
def root() -> dict:
    return {
        "service": "krushimart-matching",
        "version": __version__,
        "docs": "/docs",
        "endpoints": ["/health", "/normalize", "/match"],
    }
