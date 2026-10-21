package com.krushimart.notification.service;

import com.krushimart.common.exception.NotFoundException;
import com.krushimart.demandgap.entity.DemandOpportunity;
import com.krushimart.notification.dto.NotificationResponse;
import com.krushimart.notification.entity.Notification;
import com.krushimart.notification.entity.NotificationType;
import com.krushimart.notification.repository.NotificationRepository;
import com.krushimart.product.entity.Product;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.entity.RequestStatus;
import com.krushimart.request.repository.ProductRequestRepository;
import com.krushimart.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final int MAX_MATCH_NOTIFICATIONS = 20;
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "with", "from", "need", "needed", "want", "wanted",
            "required", "require", "looking", "available", "good", "condition", "small",
            "mini", "power", "sale", "purchase", "rent", "rental", "used", "new",
            "my", "a", "an", "of", "in", "on", "to", "or", "is", "are");

    private final NotificationRepository notificationRepository;
    private final ProductRequestRepository requestRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               ProductRequestRepository requestRepository) {
        this.notificationRepository = notificationRepository;
        this.requestRepository = requestRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markRead(User user, Long id) {
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification " + id + " was not found"));
        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public void notifyMatchingRequesters(Product product) {
        List<ProductRequest> candidates = requestRepository.findByStatusAndCategoryAndRegionIgnoreCase(
                RequestStatus.OPEN, product.getCategory(), product.getRegion());
        int created = 0;
        Set<String> productTokens = significantTokens(product.getTitle());
        for (ProductRequest request : candidates) {
            if (created >= MAX_MATCH_NOTIFICATIONS) {
                break;
            }
            if (!overlaps(productTokens, significantTokens(request.getTitle()))) {
                continue;
            }
            Long requesterId = request.getRequester().getId();
            if (notificationRepository.existsByUserIdAndTypeAndRelatedProductIdAndRelatedRequestId(
                    requesterId, NotificationType.REQUEST_MATCH, product.getId(), request.getId())) {
                continue;
            }
            Notification notification = new Notification();
            notification.setUser(request.getRequester());
            notification.setType(NotificationType.REQUEST_MATCH);
            notification.setTitle("A listing may match your request");
            notification.setMessage("\"" + product.getTitle() + "\" from " + product.getSeller().getFullName()
                    + " is now listed in " + product.getRegion() + " and may match your request \""
                    + request.getTitle() + "\".");
            notification.setRelatedProductId(product.getId());
            notification.setRelatedRequestId(request.getId());
            notification.setCreatedAt(Instant.now());
            notificationRepository.save(notification);
            created++;
        }
    }

    @Transactional
    public void notifyDemandOpportunity(User farmer, DemandOpportunity opportunity, int requestId) {
        if (notificationRepository.existsByUserIdAndTypeAndRelatedOpportunityId(
                farmer.getId(), NotificationType.DEMAND_OPPORTUNITY, opportunity.getId())) {
            return;
        }
        Notification notification = new Notification();
        notification.setUser(farmer);
        notification.setType(NotificationType.DEMAND_OPPORTUNITY);
        notification.setTitle("Demand opportunity in " + opportunity.getRegion());
        notification.setMessage("Demand gap score " + opportunity.getScore().stripTrailingZeros().toPlainString()
                + "/100 for " + opportunity.getCategory() + " in " + opportunity.getRegion()
                + ". " + opportunity.getReason());
        notification.setRelatedOpportunityId(opportunity.getId());
        notification.setRelatedRequestId(requestId > 0 ? Long.valueOf(requestId) : null);
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    private Set<String> significantTokens(String text) {
        if (text == null) {
            return Set.of();
        }
        return Arrays.stream(text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9 ]", " ").split("\\s+"))
                .filter(token -> token.length() > 2 && !STOP_WORDS.contains(token))
                .collect(Collectors.toSet());
    }

    private boolean overlaps(Set<String> left, Set<String> right) {
        return left.stream().anyMatch(right::contains);
    }
}
