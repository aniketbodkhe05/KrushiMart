package com.krushimart.auth.dto;

import com.krushimart.user.dto.UserResponse;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresInMs,
        UserResponse user
) {
}
