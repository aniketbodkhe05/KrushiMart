package com.krushimart.demandgap.service;

import com.krushimart.common.exception.ForbiddenException;
import com.krushimart.common.exception.NotFoundException;
import com.krushimart.demandgap.dto.DemandOpportunityResponse;
import com.krushimart.demandgap.entity.DemandOpportunity;
import com.krushimart.demandgap.entity.OpportunityStatus;
import com.krushimart.demandgap.repository.DemandOpportunityRepository;
import com.krushimart.demandgap.scoring.DemandScoreResult;
import com.krushimart.demandgap.scoring.DemandScoringService;
import com.krushimart.demandgap.scoring.DemandSignals;
import com.krushimart.notification.service.NotificationService;
import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.repository.ProductRepository;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.entity.RequestStatus;
import com.krushimart.request.repository.ProductRequestRepository;
import com.krushimart.search.entity.SearchEvent;
import com.krushimart.search.repository.SearchEventRepository;
import com.krushimart.user.entity.User;
import com.krushimart.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class DemandGapService {

    private static final int MAX_NOTIFIED_FARMERS_PER_OPPORTUNITY = 20;

    private final ProductRequestRepository requestRepository;
    private final SearchEventRepository searchEventRepository;
    private final ProductRepository productRepository;
    private final DemandOpportunityRepository opportunityRepository;
    private final DemandScoringService scoringService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final Clock clock;

    public DemandGapService(ProductRequestRepository requestRepository,
                            SearchEventRepository searchEventRepository,
                            ProductRepository productRepository,
                            DemandOpportunityRepository opportunityRepository,
                            DemandScoringService scoringService,
                            NotificationService notificationService,
                            UserRepository userRepository,
                            Clock clock) {
        this.requestRepository = requestRepository;
        this.searchEventRepository = searchEventRepository;
        this.productRepository = productRepository;
        this.opportunityRepository = opportunityRepository;
        this.scoringService = scoringService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    @Transactional
    public void refreshAndNotify() {
        List<DemandOpportunity> qualified = refresh();
        List<User> farmers = userRepository.findAll();
        for (DemandOpportunity opportunity : qualified) {
            int notified = 0;
            for (User farmer : farmers) {
                if (notified >= MAX_NOTIFIED_FARMERS_PER_OPPORTUNITY) {
                    break;
                }
                if (!farmer.isNotifyOptIn() || !isEligibleFarmer(farmer, opportunity.getCategory(), opportunity.getRegion())) {
                    continue;
                }
                notificationService.notifyDemandOpportunity(farmer, opportunity, 0);
                notified++;
            }
        }
    }

    @Transactional
    public List<DemandOpportunity> refresh() {
        Instant now = clock.instant();
        Instant since = now.minus(DemandScoringService.WINDOW_DAYS, ChronoUnit.DAYS);

        Map<String, DemandBucket> buckets = new LinkedHashMap<>();
        for (ProductRequest request : requestRepository.findByStatus(RequestStatus.OPEN)) {
            if (request.getCreatedAt() == null || request.getCreatedAt().isBefore(since)) {
                continue;
            }
            bucketFor(buckets, request.getCategory(), request.getRegion()).addRequest(request);
        }
        for (SearchEvent event : searchEventRepository.findByCreatedAtAfter(since)) {
            if (event.isMatched() || event.getCategory() == null
                    || event.getRegion() == null || event.getRegion().isBlank()) {
                continue;
            }
            bucketFor(buckets, event.getCategory(), event.getRegion()).addSearch(event);
        }

        Set<String> qualifiedKeys = new HashSet<>();
        List<DemandOpportunity> qualified = new ArrayList<>();

        for (Map.Entry<String, DemandBucket> entry : buckets.entrySet()) {
            DemandBucket bucket = entry.getValue();
            long activeListings = productRepository
                    .countByCategoryAndRegionIgnoreCaseAndListingStatusAndQuantityAvailableGreaterThan(
                            bucket.category, bucket.region, ListingStatus.ACTIVE, BigDecimal.ZERO);

            DemandScoreResult result = scoringService.calculate(new DemandSignals(
                    bucket.requestCount,
                    bucket.requesters.size(),
                    bucket.searchKeys.size(),
                    (int) activeListings,
                    bucket.lastDemandAt,
                    now
            ));

            DemandOpportunity existing = opportunityRepository
                    .findByCategoryAndRegionIgnoreCase(bucket.category, bucket.region)
                    .orElse(null);

            if (!result.qualified()) {
                if (existing != null && existing.getStatus() == OpportunityStatus.OPEN) {
                    existing.setStatus(OpportunityStatus.EXPIRED);
                    existing.setUpdatedAt(now);
                    opportunityRepository.save(existing);
                }
                continue;
            }

            DemandOpportunity opportunity = existing == null ? new DemandOpportunity() : existing;
            opportunity.setTitle(buildTitle(bucket));
            opportunity.setCategory(bucket.category);
            opportunity.setRegion(bucket.region);
            opportunity.setScore(result.score());
            opportunity.setThreshold(result.threshold());
            opportunity.setRequestCount(bucket.requestCount);
            opportunity.setDistinctRequesters(bucket.requesters.size());
            opportunity.setUnmatchedSearches(bucket.searchKeys.size());
            opportunity.setActiveListings((int) activeListings);
            opportunity.setReason(result.reason());
            opportunity.setStatus(OpportunityStatus.OPEN);
            opportunity.setLastDemandAt(bucket.lastDemandAt == null ? now : bucket.lastDemandAt);
            opportunity.setUpdatedAt(now);
            if (opportunity.getCreatedAt() == null) {
                opportunity.setCreatedAt(now);
            }
            DemandOpportunity saved = opportunityRepository.save(opportunity);
            qualified.add(saved);
            qualifiedKeys.add(entry.getKey());
        }

        for (DemandOpportunity existing : opportunityRepository.findByStatusOrderByScoreDesc(OpportunityStatus.OPEN)) {
            String key = key(existing.getCategory(), existing.getRegion());
            if (!qualifiedKeys.contains(key)) {
                existing.setStatus(OpportunityStatus.EXPIRED);
                existing.setUpdatedAt(now);
                opportunityRepository.save(existing);
            }
        }

        qualified.sort(Comparator.comparing(DemandOpportunity::getScore).reversed());
        return qualified;
    }

    @Transactional
    public List<DemandOpportunityResponse> listForFarmer(User farmer, BigDecimal minScore, ProductCategory category) {
        if (!farmer.canSell()) {
            throw new ForbiddenException("DemandGap opportunities are available to farmer accounts");
        }
        refreshAndNotify();
        BigDecimal floor = minScore == null ? DemandScoringService.THRESHOLD : minScore;
        return opportunityRepository
                .findByStatusAndScoreGreaterThanEqualOrderByScoreDesc(OpportunityStatus.OPEN, floor)
                .stream()
                .filter(opportunity -> category == null || opportunity.getCategory() == category)
                .filter(opportunity -> isEligibleFarmer(farmer, opportunity.getCategory(), opportunity.getRegion()))
                .map(DemandOpportunityResponse::from)
                .toList();
    }

    @Transactional
    public DemandOpportunityResponse getForFarmer(User farmer, Long id) {
        if (!farmer.canSell()) {
            throw new ForbiddenException("DemandGap opportunities are available to farmer accounts");
        }
        refreshAndNotify();
        DemandOpportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Demand opportunity " + id + " was not found"));
        if (opportunity.getStatus() != OpportunityStatus.OPEN
                || !isEligibleFarmer(farmer, opportunity.getCategory(), opportunity.getRegion())) {
            throw new ForbiddenException("This opportunity is not available to you");
        }
        return DemandOpportunityResponse.from(opportunity);
    }

    private boolean isEligibleFarmer(User user, ProductCategory category, String region) {
        if (!user.canSell() || user.getRegion() == null) {
            return false;
        }
        if (user.getRegion().equalsIgnoreCase(region)) {
            return true;
        }
        if (user.getPreferredCategories() == null || user.getPreferredCategories().isBlank()) {
            return false;
        }
        return Arrays.stream(user.getPreferredCategories().split(","))
                .map(String::trim)
                .anyMatch(value -> value.equals(category.name()));
    }

    private String buildTitle(DemandBucket bucket) {
        String base = bucket.representativeTitle == null
                ? "Demand for " + bucket.category + " in " + bucket.region
                : bucket.representativeTitle;
        if (bucket.requestCount > 1) {
            base = base + " (+" + (bucket.requestCount - 1) + " similar)";
        }
        return base.length() > 160 ? base.substring(0, 157) + "..." : base;
    }

    private DemandBucket bucketFor(Map<String, DemandBucket> buckets, ProductCategory category, String region) {
        String key = key(category, region);
        return buckets.computeIfAbsent(key, ignored -> new DemandBucket(category, region.trim()));
    }

    private String key(ProductCategory category, String region) {
        return category.name() + "|" + region.trim().toLowerCase(Locale.ROOT);
    }

    private static final class DemandBucket {
        private final ProductCategory category;
        private final String region;
        private final Set<Long> requesters = new HashSet<>();
        private final Set<String> searchKeys = new HashSet<>();
        private int requestCount;
        private Instant lastDemandAt;
        private String representativeTitle;

        private DemandBucket(ProductCategory category, String region) {
            this.category = category;
            this.region = region;
        }

        private void addRequest(ProductRequest request) {
            requestCount++;
            requesters.add(request.getRequester().getId());
            if (representativeTitle == null || request.getTitle().length() < representativeTitle.length()) {
                representativeTitle = request.getTitle();
            }
            lastDemandAt = latest(lastDemandAt, request.getCreatedAt());
        }

        private void addSearch(SearchEvent event) {
            String normalizedQuery = event.getQuery().trim().toLowerCase(Locale.ROOT);
            String dedupeKey = event.getUser() != null
                    ? "u" + event.getUser().getId() + "|" + normalizedQuery
                    : "a|" + normalizedQuery + "|" + event.getCreatedAt().truncatedTo(ChronoUnit.DAYS);
            searchKeys.add(dedupeKey);
            lastDemandAt = latest(lastDemandAt, event.getCreatedAt());
        }

        private Instant latest(Instant current, Instant candidate) {
            if (candidate == null) {
                return current;
            }
            return current == null || candidate.isAfter(current) ? candidate : current;
        }
    }
}
