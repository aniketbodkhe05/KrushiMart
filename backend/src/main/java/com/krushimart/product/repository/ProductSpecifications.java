package com.krushimart.product.repository;

import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.Product;
import com.krushimart.product.entity.ProductCategory;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> marketplace(String query,
                                                     ProductCategory category,
                                                     String region,
                                                     Boolean available) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (Boolean.TRUE.equals(available)) {
                predicates.add(cb.equal(root.get("listingStatus"), ListingStatus.ACTIVE));
                predicates.add(cb.greaterThan(root.get("quantityAvailable"), BigDecimal.ZERO));
            } else if (Boolean.FALSE.equals(available)) {
                Predicate activeWithStock = cb.and(
                        cb.equal(root.get("listingStatus"), ListingStatus.ACTIVE),
                        cb.greaterThan(root.get("quantityAvailable"), BigDecimal.ZERO));
                predicates.add(cb.not(activeWithStock));
            }
            if (query != null && !query.isBlank()) {
                String like = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("region")), like)));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (region != null && !region.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("region")), region.trim().toLowerCase()));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
