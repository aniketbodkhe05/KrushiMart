package com.krushimart.matching.dto;

import java.util.List;

public record NormalizeResponse(
        String original,
        String normalized,
        List<String> tokens,
        String languageGuess,
        String normalizedBy
) {
}
