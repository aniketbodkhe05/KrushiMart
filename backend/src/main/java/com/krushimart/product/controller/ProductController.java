package com.krushimart.product.controller;

import com.krushimart.common.response.PageResponse;
import com.krushimart.product.dto.ProductResponse;
import com.krushimart.product.dto.ProductWriteRequest;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.service.ProductService;
import com.krushimart.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final CurrentUserService currentUserService;

    public ProductController(ProductService productService, CurrentUserService currentUserService) {
        this.productService = productService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public PageResponse<ProductResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "true") Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return productService.search(q, category, region, available, page, size, sort);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return productService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('FARMER','BOTH')")
    public ProductResponse create(@Valid @RequestBody ProductWriteRequest request) {
        return productService.create(currentUserService.requireUser(), request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER','BOTH')")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductWriteRequest request) {
        return productService.update(id, currentUserService.requireUser(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('FARMER','BOTH')")
    public void deactivate(@PathVariable Long id) {
        productService.deactivate(id, currentUserService.requireUser());
    }
}
