package com.krushimart.user.dto;

import com.krushimart.product.entity.ProductCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateProfileRequest(
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @NotBlank @Size(min = 2, max = 80) String region,
        List<ProductCategory> preferredCategories,
        Boolean notifyOptIn,
        Boolean contactVisible
) {
}
