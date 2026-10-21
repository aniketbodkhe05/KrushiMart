package com.krushimart.notification.dto;

import com.krushimart.notification.entity.Notification;
import com.krushimart.notification.entity.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        boolean read,
        Long relatedProductId,
        Long relatedRequestId,
        Long relatedOpportunityId,
        Instant createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getRelatedProductId(),
                notification.getRelatedRequestId(),
                notification.getRelatedOpportunityId(),
                notification.getCreatedAt()
        );
    }
}
