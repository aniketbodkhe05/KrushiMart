package com.krushimart.demandgap.entity;

import com.krushimart.product.entity.ProductCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "demand_opportunities",
        uniqueConstraints = @UniqueConstraint(name = "uk_opportunity_category_region", columnNames = {"category", "region"}))
public class DemandOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductCategory category;

    @Column(nullable = false, length = 80)
    private String region;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal threshold;

    @Column(name = "request_count", nullable = false)
    private int requestCount;

    @Column(name = "distinct_requesters", nullable = false)
    private int distinctRequesters;

    @Column(name = "unmatched_searches", nullable = false)
    private int unmatchedSearches;

    @Column(name = "active_listings", nullable = false)
    private int activeListings;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OpportunityStatus status = OpportunityStatus.OPEN;

    @Column(name = "last_demand_at", nullable = false)
    private Instant lastDemandAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public BigDecimal getThreshold() {
        return threshold;
    }

    public void setThreshold(BigDecimal threshold) {
        this.threshold = threshold;
    }

    public int getRequestCount() {
        return requestCount;
    }

    public void setRequestCount(int requestCount) {
        this.requestCount = requestCount;
    }

    public int getDistinctRequesters() {
        return distinctRequesters;
    }

    public void setDistinctRequesters(int distinctRequesters) {
        this.distinctRequesters = distinctRequesters;
    }

    public int getUnmatchedSearches() {
        return unmatchedSearches;
    }

    public void setUnmatchedSearches(int unmatchedSearches) {
        this.unmatchedSearches = unmatchedSearches;
    }

    public int getActiveListings() {
        return activeListings;
    }

    public void setActiveListings(int activeListings) {
        this.activeListings = activeListings;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public OpportunityStatus getStatus() {
        return status;
    }

    public void setStatus(OpportunityStatus status) {
        this.status = status;
    }

    public Instant getLastDemandAt() {
        return lastDemandAt;
    }

    public void setLastDemandAt(Instant lastDemandAt) {
        this.lastDemandAt = lastDemandAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
