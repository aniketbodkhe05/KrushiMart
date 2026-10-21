package com.krushimart.product.service;

import com.krushimart.common.exception.ForbiddenException;
import com.krushimart.common.exception.NotFoundException;
import com.krushimart.common.response.PageResponse;
import com.krushimart.notification.service.NotificationService;
import com.krushimart.product.dto.ProductResponse;
import com.krushimart.product.dto.ProductWriteRequest;
import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.Product;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.mapper.ProductMapper;
import com.krushimart.product.repository.ProductRepository;
import com.krushimart.product.repository.ProductSpecifications;
import com.krushimart.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

@Service
public class ProductService {

    private static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "updatedAt", "price", "title");

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final NotificationService notificationService;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper,
                          NotificationService notificationService) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String query,
                                                ProductCategory category,
                                                String region,
                                                Boolean available,
                                                int page,
                                                int size,
                                                String sort) {
        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(size, 1), 50),
                parseSort(sort)
        );
        Page<Product> result = productRepository.findAll(
                ProductSpecifications.marketplace(query, category, region, available), pageable);
        return PageResponse.from(result, productMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        return productMapper.toResponse(requireProduct(id));
    }

    @Transactional
    public ProductResponse create(User seller, ProductWriteRequest request) {
        if (!seller.canSell()) {
            throw new ForbiddenException("Only farmer accounts can create listings");
        }
        Product saved = productRepository.save(productMapper.toEntity(request, seller));
        if (saved.isAvailable()) {
            notificationService.notifyMatchingRequesters(saved);
        }
        return productMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, User actor, ProductWriteRequest request) {
        Product product = requireProduct(id);
        requireOwner(product, actor);
        productMapper.apply(product, request);
        Product saved = productRepository.save(product);
        if (saved.isAvailable()) {
            notificationService.notifyMatchingRequesters(saved);
        }
        return productMapper.toResponse(saved);
    }

    @Transactional
    public void deactivate(Long id, User actor) {
        Product product = requireProduct(id);
        requireOwner(product, actor);
        product.setListingStatus(ListingStatus.INACTIVE);
        product.setUpdatedAt(Instant.now());
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public long countAvailable(String query, ProductCategory category, String region) {
        return productRepository.count(
                ProductSpecifications.marketplace(query, category, region, true));
    }

    @Transactional(readOnly = true)
    public Product requireProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " was not found"));
    }

    private void requireOwner(Product product, User actor) {
        if (!product.getSeller().getId().equals(actor.getId())) {
            throw new ForbiddenException("Only the listing owner can modify this product");
        }
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sort.split(",", 2);
        String field = SORTABLE_FIELDS.contains(parts[0]) ? parts[0] : "createdAt";
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
