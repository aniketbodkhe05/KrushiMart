package com.krushimart.product.dto;

import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.entity.ProductUnit;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductWriteRequest(
        @NotBlank @Size(min = 3, max = 140) String title,
        @NotBlank @Size(min = 10, max = 2000) String description,
        @NotNull ProductCategory category,
        @NotNull @DecimalMin("0.0") @DecimalMax("9999999999.99")
        @Digits(integer = 10, fraction = 2) BigDecimal price,
        @NotNull @DecimalMin("0.0") @DecimalMax("9999999999.99")
        @Digits(integer = 10, fraction = 2) BigDecimal quantityAvailable,
        @NotNull ProductUnit unit,
        ListingStatus listingStatus,
        @Pattern(regexp = "^(en|hi|mr)$", message = "must be en, hi, or mr") String language,
        @NotBlank @Size(min = 2, max = 80) String region,
        @Size(max = 500) String imageUrl
) {
}
