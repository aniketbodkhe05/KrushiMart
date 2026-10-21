package com.krushimart.matching.dto;

import java.util.List;

public record MatchResponse(
        String queryNormalized,
        List<MatchResult> matches,
        String provider
) {
}
