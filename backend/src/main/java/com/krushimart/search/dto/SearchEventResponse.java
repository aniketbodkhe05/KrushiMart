package com.krushimart.search.dto;

public record SearchEventResponse(
        Long id,
        boolean matched,
        int resultCount,
        String message
) {
}
