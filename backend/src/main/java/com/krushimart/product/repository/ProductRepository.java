package com.krushimart.product.repository;

import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.Product;
import com.krushimart.product.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    long countByCategoryAndRegionIgnoreCaseAndListingStatusAndQuantityAvailableGreaterThan(
            ProductCategory category, String region, ListingStatus status, BigDecimal quantity);
}
