package com.krushimart.user.dto;

import com.krushimart.product.entity.ProductCategory;
import com.krushimart.user.entity.User;
import com.krushimart.user.entity.UserRole;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

public record UserResponse(
        Long id,
        String fullName,
        String phone,
        UserRole role,
        String region,
        List<ProductCategory> preferredCategories,
        boolean notifyOptIn,
        boolean contactVisible,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        List<ProductCategory> categories = List.of();
        if (user.getPreferredCategories() != null && !user.getPreferredCategories().isBlank()) {
            categories = Arrays.stream(user.getPreferredCategories().split(","))
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .map(ProductCategory::valueOf)
                    .toList();
        }
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getRegion(),
                categories,
                user.isNotifyOptIn(),
                user.isContactVisible(),
                user.getCreatedAt()
        );
    }
}
