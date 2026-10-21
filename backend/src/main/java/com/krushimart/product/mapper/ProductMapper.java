package com.krushimart.product.mapper;

import com.krushimart.product.dto.ProductResponse;
import com.krushimart.product.dto.ProductWriteRequest;
import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.Product;
import com.krushimart.user.entity.User;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class ProductMapper {

    public Product toEntity(ProductWriteRequest request, User seller) {
        Product product = new Product();
        apply(product, request);
        product.setSeller(seller);
        product.setCurrency("INR");
        product.setListingStatus(request.listingStatus() == null ? ListingStatus.ACTIVE : request.listingStatus());
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());
        return product;
    }

    public void apply(Product product, ProductWriteRequest request) {
        product.setTitle(request.title().trim());
        product.setDescription(request.description().trim());
        product.setCategory(request.category());
        product.setPrice(request.price());
        product.setQuantityAvailable(request.quantityAvailable());
        product.setUnit(request.unit());
        product.setLanguage(request.language() == null ? "en" : request.language());
        product.setRegion(request.region().trim());
        product.setImageUrl(request.imageUrl() == null || request.imageUrl().isBlank()
                ? null : request.imageUrl().trim());
        if (request.listingStatus() != null) {
            product.setListingStatus(request.listingStatus());
        }
        product.setUpdatedAt(Instant.now());
    }

    public ProductResponse toResponse(Product product) {
        return ProductResponse.from(product);
    }
}
