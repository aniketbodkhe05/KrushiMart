package com.krushimart.auth.dto;

import com.krushimart.product.entity.ProductCategory;
import com.krushimart.user.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @NotBlank @Pattern(regexp = "^[6-9][0-9]{9}$", message = "must be a 10-digit Indian mobile number")
        String phone,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotNull UserRole role,
        @NotBlank @Size(min = 2, max = 80) String region,
        List<ProductCategory> preferredCategories,
        Boolean notifyOptIn
) {
}
