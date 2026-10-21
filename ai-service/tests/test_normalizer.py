import pytest

from app.normalizer import guess_language, normalize, tokenize


def test_marathi_phrase_normalizes_to_english_product_terms():
    result = normalize("ठिबक सिंचन जोड")

    assert result.normalized == "drip irrigation connector"
    assert result.tokens == ["drip", "irrigation", "connector"]
    assert result.language_guess == "mr"


def test_hindi_fertilizer_phrase_normalizes_to_english():
    result = normalize("जैविक खाद")

    assert result.normalized == "organic fertilizer"
    assert result.language_guess == "hi"


def test_romanized_and_spelling_variants_are_normalized():
    assert normalize("thibak sinchan jod").normalized == "drip irrigation connector"
    assert normalize("jaivik khaad").normalized == "organic fertilizer"
    assert normalize("mini tillar").normalized == "mini tiller"


def test_tokens_are_deduplicated_and_stop_words_removed():
    tokens = tokenize("The drip pipe and the drip irrigation pipe")

    assert tokens == ["drip", "pipe", "irrigation"]


def test_empty_text_tokenizes_to_empty_list():
    assert tokenize("") == []
    assert normalize("").language_guess == "unknown"


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("mini tiller", "en"),
        ("जैविक खाद", "hi"),
        ("ठिबक सिंचन", "mr"),
        ("", "unknown"),
    ],
)
def test_language_guessing(text, expected):
    assert guess_language(text) == expected
