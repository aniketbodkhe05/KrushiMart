package com.krushimart.matching.dto;

import com.krushimart.product.entity.ProductCategory;

public record MatchCandidate(
        Long productId,
        String title,
        ProductCategory category,
        String description
) {
}
