package com.krushimart.request.dto;

import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.entity.ProductUnit;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.entity.RequestStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductRequestResponse(
        Long id,
        Long requesterId,
        String requesterName,
        String title,
        String description,
        ProductCategory category,
        String region,
        BigDecimal quantity,
        ProductUnit unit,
        String language,
        RequestStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductRequestResponse from(ProductRequest request) {
        return new ProductRequestResponse(
                request.getId(),
                request.getRequester().getId(),
                request.getRequester().getFullName(),
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getRegion(),
                request.getQuantity(),
                request.getUnit(),
                request.getLanguage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
