package com.krushimart.request.dto;

import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.entity.ProductUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequestWrite(
        @NotBlank @Size(min = 3, max = 140) String title,
        @NotBlank @Size(max = 2000) String description,
        @NotNull ProductCategory category,
        @NotBlank @Size(min = 2, max = 80) String region,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
        @NotNull ProductUnit unit,
        @Pattern(regexp = "^(en|hi|mr)$", message = "must be en, hi, or mr") String language
) {
}
