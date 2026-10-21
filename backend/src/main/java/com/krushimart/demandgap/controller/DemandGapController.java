package com.krushimart.demandgap.controller;

import com.krushimart.demandgap.dto.DemandOpportunityResponse;
import com.krushimart.demandgap.service.DemandGapService;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.security.CurrentUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/demand/opportunities")
@PreAuthorize("hasAnyRole('FARMER','BOTH')")
public class DemandGapController {

    private final DemandGapService demandGapService;
    private final CurrentUserService currentUserService;

    public DemandGapController(DemandGapService demandGapService,
                               CurrentUserService currentUserService) {
        this.demandGapService = demandGapService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<DemandOpportunityResponse> list(
            @RequestParam(required = false) BigDecimal minScore,
            @RequestParam(required = false) ProductCategory category) {
        return demandGapService.listForFarmer(currentUserService.requireUser(), minScore, category);
    }

    @GetMapping("/{id}")
    public DemandOpportunityResponse get(@PathVariable Long id) {
        return demandGapService.getForFarmer(currentUserService.requireUser(), id);
    }
}
