package com.krushimart.demandgap.scoring;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;

/**
 * Deterministic, explainable scoring. It is intentionally simple and rule-based so that
 * availability and notification decisions never depend on an AI model.
 */
@Service
public class DemandScoringService {

    public static final BigDecimal THRESHOLD = BigDecimal.valueOf(30);
    public static final int WINDOW_DAYS = 30;

    public DemandScoreResult calculate(DemandSignals signals) {
        int explicit = Math.min(Math.max(signals.explicitRequests(), 0), 10);
        int requesters = Math.min(Math.max(signals.distinctRequesters(), 0), 10);
        int searches = Math.min(Math.max(signals.unmatchedSearches(), 0), 10);
        int listings = Math.max(signals.activeListings(), 0);

        int requestPoints = explicit * 8;
        int requesterPoints = requesters * 12;
        int searchPoints = searches * 2;
        int recencyBonus = recencyBonus(signals.lastDemandAt(), signals.now());
        int supplyPenalty = Math.min(listings * 10, 40);

        int raw = requestPoints + requesterPoints + searchPoints + recencyBonus;
        int bounded = Math.max(0, Math.min(100, raw - supplyPenalty));
        boolean qualified = bounded >= THRESHOLD.intValue() && signals.explicitRequests() > 0;

        String reason = explicit + " explicit request" + (explicit == 1 ? "" : "s")
                + " from " + requesters + " distinct requester" + (requesters == 1 ? "" : "s")
                + " (+" + (requestPoints + requesterPoints) + "), "
                + signals.unmatchedSearches() + " recent unmatched search"
                + (signals.unmatchedSearches() == 1 ? "" : "es")
                + " (+" + searchPoints + "), recency bonus (+" + recencyBonus + "), "
                + "minus " + supplyPenalty + " for " + listings + " active listing"
                + (listings == 1 ? "" : "s") + " = " + bounded + "/100. "
                + "Opportunity threshold is " + THRESHOLD.intValue() + ".";

        return new DemandScoreResult(
                BigDecimal.valueOf(bounded).setScale(2, RoundingMode.HALF_UP),
                THRESHOLD.setScale(2, RoundingMode.HALF_UP),
                qualified,
                reason,
                requestPoints,
                requesterPoints,
                searchPoints,
                recencyBonus,
                supplyPenalty
        );
    }

    private int recencyBonus(Instant lastDemandAt, Instant now) {
        if (lastDemandAt == null || now == null) {
            return 0;
        }
        Duration age = Duration.between(lastDemandAt, now);
        if (age.isNegative()) {
            return 5;
        }
        if (age.toDays() <= 7) {
            return 5;
        }
        if (age.toDays() <= WINDOW_DAYS) {
            return 2;
        }
        return 0;
    }
}
