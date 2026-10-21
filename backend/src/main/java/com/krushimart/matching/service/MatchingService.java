package com.krushimart.matching.service;

import com.krushimart.matching.client.AiClient;
import com.krushimart.matching.dto.AiHealthResponse;
import com.krushimart.matching.dto.MatchRequest;
import com.krushimart.matching.dto.MatchResponse;
import com.krushimart.matching.dto.MatchResult;
import com.krushimart.matching.dto.NormalizeRequest;
import com.krushimart.matching.dto.NormalizeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);

    private final AiClient aiClient;
    private final FallbackMatchingService fallback;

    public MatchingService(AiClient aiClient, FallbackMatchingService fallback) {
        this.aiClient = aiClient;
        this.fallback = fallback;
    }

    public AiHealthResponse health() {
        try {
            AiHealthResponse health = aiClient.health();
            if (health != null) {
                return new AiHealthResponse(
                        health.status() == null ? "ok" : health.status(),
                        health.provider() == null ? "ai" : health.provider(),
                        true,
                        true,
                        health.detail() == null ? "Python service reachable" : health.detail()
                );
            }
        } catch (Exception ex) {
            log.info("AI service unavailable, deterministic fallback is active: {}", ex.getMessage());
        }
        return new AiHealthResponse(
                "degraded",
                "fallback",
                false,
                true,
                "AI service is unavailable. Marketplace search and deterministic matching still work."
        );
    }

    public NormalizeResponse normalize(NormalizeRequest request) {
        try {
            NormalizeResponse response = aiClient.normalize(request);
            if (response != null && response.normalized() != null) {
                return new NormalizeResponse(
                        request.text(),
                        response.normalized(),
                        response.tokens() == null ? List.of() : response.tokens(),
                        response.languageGuess() == null ? "unknown" : response.languageGuess(),
                        "ai"
                );
            }
        } catch (Exception ex) {
            log.info("AI normalize failed; using fallback: {}", ex.getMessage());
        }
        return fallback.normalize(request.text());
    }

    public MatchResponse match(MatchRequest request) {
        try {
            MatchResponse response = aiClient.match(request);
            MatchResponse validated = validate(response, request);
            if (validated != null) {
                return validated;
            }
            log.warn("AI match response failed validation; using deterministic fallback");
        } catch (Exception ex) {
            log.info("AI match failed; using deterministic fallback: {}", ex.getMessage());
        }
        return fallback.match(request);
    }

    private MatchResponse validate(MatchResponse response, MatchRequest request) {
        if (response == null || response.matches() == null) {
            return null;
        }
        Set<Long> candidateIds = request.candidates().stream()
                .map(candidate -> candidate.productId())
                .collect(Collectors.toSet());
        List<MatchResult> valid = response.matches().stream()
                .filter(result -> result != null
                        && result.productId() != null
                        && candidateIds.contains(result.productId())
                        && result.confidence() >= 0 && result.confidence() <= 1)
                .toList();
        if (valid.isEmpty()) {
            return null;
        }
        return new MatchResponse(
                response.queryNormalized() == null ? request.query() : response.queryNormalized(),
                valid,
                "ai"
        );
    }
}
