package com.krushimart.request.controller;

import com.krushimart.request.dto.ProductRequestResponse;
import com.krushimart.request.dto.ProductRequestWrite;
import com.krushimart.request.service.ProductRequestService;
import com.krushimart.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ProductRequestController {

    private final ProductRequestService requestService;
    private final CurrentUserService currentUserService;

    public ProductRequestController(ProductRequestService requestService,
                                    CurrentUserService currentUserService) {
        this.requestService = requestService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductRequestResponse create(@Valid @RequestBody ProductRequestWrite request) {
        return requestService.create(currentUserService.requireUser(), request);
    }

    @GetMapping("/mine")
    public List<ProductRequestResponse> mine() {
        return requestService.listMine(currentUserService.requireUser());
    }

    @GetMapping("/{id}")
    public ProductRequestResponse get(@PathVariable Long id) {
        return requestService.get(currentUserService.requireUser(), id);
    }
}
