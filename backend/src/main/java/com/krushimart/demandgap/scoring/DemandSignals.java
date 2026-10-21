package com.krushimart.demandgap.scoring;

import java.time.Instant;

public record DemandSignals(
        int explicitRequests,
        int distinctRequesters,
        int unmatchedSearches,
        int activeListings,
        Instant lastDemandAt,
        Instant now
) {
}
