package com.krushimart.request.service;

import com.krushimart.common.exception.ForbiddenException;
import com.krushimart.common.exception.NotFoundException;
import com.krushimart.demandgap.service.DemandGapService;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.request.dto.ProductRequestResponse;
import com.krushimart.request.dto.ProductRequestWrite;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.entity.RequestStatus;
import com.krushimart.request.repository.ProductRequestRepository;
import com.krushimart.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Service
public class ProductRequestService {

    private final ProductRequestRepository requestRepository;
    private final DemandGapService demandGapService;

    public ProductRequestService(ProductRequestRepository requestRepository,
                                 DemandGapService demandGapService) {
        this.requestRepository = requestRepository;
        this.demandGapService = demandGapService;
    }

    @Transactional
    public ProductRequestResponse create(User requester, ProductRequestWrite request) {
        ProductRequest entity = new ProductRequest();
        entity.setRequester(requester);
        entity.setTitle(request.title().trim());
        entity.setDescription(request.description().trim());
        entity.setCategory(request.category());
        entity.setRegion(request.region().trim());
        entity.setQuantity(request.quantity());
        entity.setUnit(request.unit());
        entity.setLanguage(request.language() == null ? "en" : request.language());
        entity.setStatus(RequestStatus.OPEN);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        ProductRequest saved = requestRepository.save(entity);

        demandGapService.refreshAndNotify();
        return ProductRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductRequestResponse> listMine(User user) {
        return requestRepository.findByRequesterIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(ProductRequestResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductRequestResponse get(User user, Long id) {
        ProductRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Request " + id + " was not found"));
        boolean owner = request.getRequester().getId().equals(user.getId());
        if (!owner && !isEligibleFarmer(user, request.getCategory(), request.getRegion())) {
            throw new ForbiddenException("You are not eligible to view this request");
        }
        return ProductRequestResponse.from(request);
    }

    private boolean isEligibleFarmer(User user, ProductCategory category, String region) {
        if (!user.canSell()) {
            return false;
        }
        if (user.getRegion() != null && user.getRegion().equalsIgnoreCase(region)) {
            return true;
        }
        if (user.getPreferredCategories() == null || user.getPreferredCategories().isBlank()) {
            return false;
        }
        return Arrays.stream(user.getPreferredCategories().split(","))
                .map(String::trim)
                .anyMatch(value -> value.equals(category.name()));
    }
}
