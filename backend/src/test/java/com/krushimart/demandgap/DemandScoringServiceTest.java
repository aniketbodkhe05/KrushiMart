package com.krushimart.demandgap;

import com.krushimart.demandgap.scoring.DemandScoreResult;
import com.krushimart.demandgap.scoring.DemandScoringService;
import com.krushimart.demandgap.scoring.DemandSignals;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class DemandScoringServiceTest {

    private final DemandScoringService scoring = new DemandScoringService();
    private final Instant now = Instant.parse("2026-10-21T10:00:00Z");

    @Test
    void noDemandProducesZeroAndIsNotQualified() {
        DemandScoreResult result = scoring.calculate(new DemandSignals(0, 0, 0, 0, null, now));

        assertThat(result.score()).isEqualByComparingTo("0");
        assertThat(result.qualified()).isFalse();
    }

    @Test
    void oneUnsuccessfulSearchIsOnlyAWeakSignal() {
        DemandScoreResult result = scoring.calculate(
                new DemandSignals(0, 0, 1, 0, now.minusSeconds(3600), now));

        assertThat(result.score().doubleValue()).isBetween(1.0, 10.0);
        assertThat(result.qualified()).isFalse();
        assertThat(result.reason()).contains("explicit request");
    }

    @Test
    void multipleIndependentRequestsCreateAQualifiedOpportunity() {
        DemandScoreResult result = scoring.calculate(
                new DemandSignals(3, 3, 3, 1, now.minusSeconds(3600), now));

        assertThat(result.score().doubleValue()).isGreaterThanOrEqualTo(30);
        assertThat(result.qualified()).isTrue();
        assertThat(result.reason()).contains("3 distinct requesters");
    }

    @Test
    void activeSupplyReducesTheScore() {
        DemandScoreResult withoutSupply = scoring.calculate(
                new DemandSignals(3, 3, 3, 0, now.minusSeconds(3600), now));
        DemandScoreResult withSupply = scoring.calculate(
                new DemandSignals(3, 3, 3, 4, now.minusSeconds(3600), now));

        assertThat(withSupply.score()).isLessThan(withoutSupply.score());
        assertThat(withSupply.reason()).contains("4 active listings");
    }

    @Test
    void explicitRequestsAreRequiredEvenWhenSearchVolumeIsHigh() {
        DemandScoreResult result = scoring.calculate(
                new DemandSignals(0, 0, 10, 0, now.minusSeconds(3600), now));

        assertThat(result.qualified()).isFalse();
    }

    @Test
    void oldDemandLosesTheRecencyBonus() {
        DemandScoreResult recent = scoring.calculate(
                new DemandSignals(2, 2, 0, 0, now.minusSeconds(3600), now));
        DemandScoreResult old = scoring.calculate(
                new DemandSignals(2, 2, 0, 0, now.minusSeconds(20 * 86400L), now));

        assertThat(recent.recencyBonus()).isEqualTo(5);
        assertThat(old.recencyBonus()).isEqualTo(2);
    }
}
