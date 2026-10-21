package com.krushimart.search.dto;

import com.krushimart.product.entity.ProductCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SearchEventRequest(
        @NotBlank @Size(min = 2, max = 200) String query,
        ProductCategory category,
        @Size(max = 80) String region,
        @Pattern(regexp = "^(en|hi|mr)$", message = "must be en, hi, or mr") String language
) {
}
