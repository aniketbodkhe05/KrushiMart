package com.krushimart.matching;

import com.krushimart.matching.dto.MatchCandidate;
import com.krushimart.matching.dto.MatchRequest;
import com.krushimart.matching.dto.MatchResponse;
import com.krushimart.matching.dto.NormalizeResponse;
import com.krushimart.matching.service.FallbackMatchingService;
import com.krushimart.product.entity.ProductCategory;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FallbackMatchingServiceTest {

    private final FallbackMatchingService service = new FallbackMatchingService();

    @Test
    void normalizesMarathiDripIrrigationQuery() {
        NormalizeResponse response = service.normalize("ठिबक सिंचन जोड");

        assertThat(response.languageGuess()).isEqualTo("mr");
        assertThat(response.normalized()).contains("drip", "irrigation", "connector");
        assertThat(response.normalizedBy()).isEqualTo("fallback");
    }

    @Test
    void matchesConnectorAndRejectsPesticide() {
        MatchResponse response = service.match(new MatchRequest(
                "ठिबक सिंचन जोड",
                List.of(
                        candidate(2L, "Drip Irrigation Pipe Connector", ProductCategory.IRRIGATION),
                        candidate(7L, "Neem Oil Pesticide", ProductCategory.PESTICIDES)),
                0.6
        ));

        assertThat(response.provider()).isEqualTo("fallback");
        assertThat(find(response, 2L).match()).isTrue();
        assertThat(find(response, 7L).match()).isFalse();
        assertThat(find(response, 2L).confidence()).isBetween(0.0, 1.0);
    }

    @Test
    void handlesSpellingVariationForTiller() {
        MatchResponse response = service.match(new MatchRequest(
                "mini tillar",
                List.of(candidate(1L, "Mini Tiller 7HP", ProductCategory.MACHINERY)),
                0.6
        ));

        assertThat(find(response, 1L).match()).isTrue();
    }

    @Test
    void doesNotMatchAnIrrigationPumpToAConnectorQuery() {
        MatchResponse response = service.match(new MatchRequest(
                "drip irrigation connector",
                List.of(candidate(6L, "Borewell Submersible Pump 1HP", ProductCategory.IRRIGATION)),
                0.6
        ));

        assertThat(find(response, 6L).match()).isFalse();
        assertThat(find(response, 6L).equivalence()).isNotEqualTo("EQUIVALENT");
    }

    private MatchCandidate candidate(Long id, String title, ProductCategory category) {
        return new MatchCandidate(id, title, category, null);
    }

    private com.krushimart.matching.dto.MatchResult find(MatchResponse response, Long id) {
        return response.matches().stream()
                .filter(result -> result.productId().equals(id))
                .findFirst()
                .orElseThrow();
    }
}
