import re
from dataclasses import dataclass
from typing import Iterable


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "for",
    "from",
    "in",
    "is",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
}

PHRASES = {
    "ठिबक सिंचन जोड": "drip irrigation connector",
    "ठिबक सिंचन": "drip irrigation",
    "जैविक खाद": "organic fertilizer",
    "जैविक खत": "organic fertilizer",
    "सेंद्रिय खत": "organic fertilizer",
    "मिनी टिलर": "mini tiller",
    "पावर टिलर": "power tiller",
    "रोटरी टिलर": "rotary tiller",
    "drip irrigation connector": "drip irrigation connector",
    "thibak sinchan jod": "drip irrigation connector",
    "thibak sinchan": "drip irrigation",
    "jaivik khad": "organic fertilizer",
    "jaivik khaad": "organic fertilizer",
    "sendriya khat": "organic fertilizer",
    "mini tillar": "mini tiller",
    "power tillar": "power tiller",
    "rotary tillar": "rotary tiller",
}

TOKEN_SYNONYMS = {
    "ठिबक": "drip",
    "सिंचन": "irrigation",
    "जोड": "connector",
    "जोड़": "connector",
    "कनेक्टर": "connector",
    "जैविक": "organic",
    "सेंद्रिय": "organic",
    "खाद": "fertilizer",
    "खत": "fertilizer",
    "बीज": "seed",
    "बियाणे": "seed",
    "ट्रैक्टर": "tractor",
    "टिलर": "tiller",
    "पंप": "pump",
    "फवारणी": "sprayer",
    "स्प्रेयर": "sprayer",
    "नांगर": "plough",
    "कुदळ": "hoe",
    "तिलर": "tiller",
    "खुरपे": "hoe",
    "कीटकनाशक": "pesticide",
    "sprinkler": "irrigation",
    "dripper": "drip",
    "drippers": "drip",
    "pipe": "pipe",
    "pipes": "pipe",
    "tillar": "tiller",
    "tillers": "tiller",
    "tiller": "tiller",
    "khad": "fertilizer",
    "khaad": "fertilizer",
    "khadha": "fertilizer",
    "khat": "fertilizer",
    "beej": "seed",
    "biyane": "seed",
    "seeds": "seed",
    "fertiliser": "fertilizer",
    "fertilisers": "fertilizer",
    "fertilizers": "fertilizer",
    "pesticides": "pesticide",
    "sprayers": "sprayer",
    "tractors": "tractor",
    "pumps": "pump",
    "ploughs": "plough",
    "hoes": "hoe",
    "rotavators": "rotavator",
    "rotavator": "rotavator",
    "power": "power",
    "mini": "mini",
    "organic": "organic",
    "irrigation": "irrigation",
    "connector": "connector",
    "connectors": "connector",
    "drip": "drip",
    "agriculture": "agriculture",
    "farming": "farming",
    "kheti": "farming",
    "krushi": "agriculture",
}

MARATHI_MARKERS = (
    "ठिबक",
    "सिंचन",
    "जोड",
    "नांगर",
    "कुदळ",
    "फवारणी",
    "बियाणे",
    "सेंद्रिय",
    "खुरपे",
    "पाणी",
    "मिनी",
)

TOKEN_PATTERN = re.compile(r"[^\W_]+", re.UNICODE)


@dataclass(frozen=True)
class Normalization:
    original: str
    normalized: str
    tokens: list[str]
    language_guess: str

    def as_response(self) -> dict:
        return {
            "original": self.original,
            "normalized": self.normalized,
            "tokens": self.tokens,
            "languageGuess": self.language_guess,
            "normalizedBy": "ai",
        }


def _sort_key(item: tuple[str, str]) -> tuple[int, int]:
    phrase = item[0]
    return (-len(phrase), -len(phrase.split()))


def _apply_phrases(text: str) -> str:
    result = text
    for phrase, replacement in sorted(PHRASES.items(), key=_sort_key):
        result = result.replace(phrase, f" {replacement} ")
    return result


def _singularize(token: str) -> str:
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 4 and token.endswith("es"):
        return token[:-2]
    if len(token) > 3 and token.endswith("s"):
        return token[:-1]
    return token


def tokenize(text: str) -> list[str]:
    folded = (text or "").casefold().strip()
    expanded = _apply_phrases(folded)
    tokens: list[str] = []
    seen: set[str] = set()

    for raw in TOKEN_PATTERN.findall(expanded):
        token = TOKEN_SYNONYMS.get(raw, raw)
        if token in STOP_WORDS:
            continue
        token = _singularize(token)
        token = TOKEN_SYNONYMS.get(token, token)
        if not token or token in STOP_WORDS or token in seen:
            continue
        seen.add(token)
        tokens.append(token)
    return tokens


def guess_language(text: str) -> str:
    if not text:
        return "unknown"
    if re.search(r"[\u0900-\u097F]", text):
        return "mr" if any(marker in text for marker in MARATHI_MARKERS) else "hi"
    return "en"


def normalize(text: str) -> Normalization:
    tokens = tokenize(text)
    return Normalization(
        original=text,
        normalized=" ".join(tokens),
        tokens=tokens,
        language_guess=guess_language(text),
    )


def normalize_many(texts: Iterable[str]) -> set[str]:
    tokens: set[str] = set()
    for text in texts:
        tokens.update(tokenize(text))
    return tokens
