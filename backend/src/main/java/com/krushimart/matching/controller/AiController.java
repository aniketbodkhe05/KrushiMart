package com.krushimart.matching.controller;

import com.krushimart.matching.dto.AiHealthResponse;
import com.krushimart.matching.dto.MatchRequest;
import com.krushimart.matching.dto.MatchResponse;
import com.krushimart.matching.dto.NormalizeRequest;
import com.krushimart.matching.dto.NormalizeResponse;
import com.krushimart.matching.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final MatchingService matchingService;

    public AiController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/health")
    public AiHealthResponse health() {
        return matchingService.health();
    }

    @PostMapping("/normalize")
    public NormalizeResponse normalize(@Valid @RequestBody NormalizeRequest request) {
        return matchingService.normalize(request);
    }

    @PostMapping("/match")
    public MatchResponse match(@Valid @RequestBody MatchRequest request) {
        return matchingService.match(request);
    }
}
