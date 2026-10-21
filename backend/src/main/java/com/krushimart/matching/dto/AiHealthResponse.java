package com.krushimart.matching.dto;

public record AiHealthResponse(
        String status,
        String provider,
        boolean aiAvailable,
        boolean fallbackAvailable,
        String detail
) {
}
