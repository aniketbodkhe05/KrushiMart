package com.krushimart.demandgap.dto;

import com.krushimart.demandgap.entity.DemandOpportunity;
import com.krushimart.demandgap.entity.OpportunityStatus;
import com.krushimart.product.entity.ProductCategory;

import java.math.BigDecimal;
import java.time.Instant;

public record DemandOpportunityResponse(
        Long id,
        String title,
        ProductCategory category,
        String region,
        BigDecimal score,
        BigDecimal threshold,
        int requestCount,
        int distinctRequesters,
        int unmatchedSearches,
        int activeListings,
        String reason,
        OpportunityStatus status,
        Instant lastDemandAt,
        Instant createdAt
) {
    public static DemandOpportunityResponse from(DemandOpportunity opportunity) {
        return new DemandOpportunityResponse(
                opportunity.getId(),
                opportunity.getTitle(),
                opportunity.getCategory(),
                opportunity.getRegion(),
                opportunity.getScore(),
                opportunity.getThreshold(),
                opportunity.getRequestCount(),
                opportunity.getDistinctRequesters(),
                opportunity.getUnmatchedSearches(),
                opportunity.getActiveListings(),
                opportunity.getReason(),
                opportunity.getStatus(),
                opportunity.getLastDemandAt(),
                opportunity.getCreatedAt()
        );
    }
}
