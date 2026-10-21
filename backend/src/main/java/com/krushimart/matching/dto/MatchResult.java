package com.krushimart.matching.dto;

public record MatchResult(
        Long productId,
        boolean match,
        double confidence,
        String reason,
        String equivalence
) {
}
