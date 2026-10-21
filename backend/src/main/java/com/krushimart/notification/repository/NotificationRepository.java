package com.krushimart.notification.repository;

import com.krushimart.notification.entity.Notification;
import com.krushimart.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndTypeAndRelatedOpportunityId(
            Long userId, NotificationType type, Long relatedOpportunityId);

    boolean existsByUserIdAndTypeAndRelatedProductIdAndRelatedRequestId(
            Long userId, NotificationType type, Long relatedProductId, Long relatedRequestId);

    long countByUserIdAndReadFalse(Long userId);
}
