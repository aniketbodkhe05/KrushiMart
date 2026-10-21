package com.krushimart.common.response;

import java.util.List;

public record ApiError(String code, String message, List<FieldDetail> details) {

    public record FieldDetail(String field, String message) {
    }

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, List.of());
    }

    public static ApiError validation(String message, List<FieldDetail> details) {
        return new ApiError("VALIDATION_ERROR", message, details);
    }
}
