package com.krushimart.matching.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MatchRequest(
        @NotBlank @Size(max = 300) String query,
        @NotEmpty @Size(max = 50) List<@Valid MatchCandidate> candidates,
        @DecimalMin("0.0") @DecimalMax("1.0") Double threshold
) {
}
