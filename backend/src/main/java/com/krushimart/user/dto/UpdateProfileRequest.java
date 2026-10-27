package com.krushimart.user.dto;

import com.krushimart.product.entity.ProductCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateProfileRequest(
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @NotBlank @Size(min = 2, max = 80) String region,
        @Size(max = 7) List<@NotNull ProductCategory> preferredCategories,
        Boolean notifyOptIn,
        Boolean contactVisible
) {
}
