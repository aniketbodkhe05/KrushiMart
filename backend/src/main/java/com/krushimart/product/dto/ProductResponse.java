package com.krushimart.product.dto;

import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.Product;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.entity.ProductUnit;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Long id,
        Long sellerId,
        String sellerName,
        String title,
        String description,
        ProductCategory category,
        BigDecimal price,
        String currency,
        BigDecimal quantityAvailable,
        ProductUnit unit,
        ListingStatus listingStatus,
        String language,
        String region,
        String imageUrl,
        boolean available,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSeller().getId(),
                product.getSeller().getFullName(),
                product.getTitle(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getCurrency(),
                product.getQuantityAvailable(),
                product.getUnit(),
                product.getListingStatus(),
                product.getLanguage(),
                product.getRegion(),
                product.getImageUrl(),
                product.isAvailable(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
