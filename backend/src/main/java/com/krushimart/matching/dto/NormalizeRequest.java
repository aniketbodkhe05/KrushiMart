package com.krushimart.matching.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NormalizeRequest(
        @NotBlank @Size(max = 300) String text
) {
}
