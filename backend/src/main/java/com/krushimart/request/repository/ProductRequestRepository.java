package com.krushimart.request.repository;

import com.krushimart.product.entity.ProductCategory;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ProductRequestRepository extends JpaRepository<ProductRequest, Long> {

    List<ProductRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    List<ProductRequest> findByStatus(RequestStatus status);

    List<ProductRequest> findByStatusAndCategoryAndRegionIgnoreCase(
            RequestStatus status, ProductCategory category, String region);

    long countByStatusAndCategoryAndRegionIgnoreCase(
            RequestStatus status, ProductCategory category, String region);

    @Query("""
            select count(distinct r.requester.id)
            from ProductRequest r
            where r.status = :status
              and r.category = :category
              and lower(r.region) = lower(:region)
            """)
    long countDistinctRequesters(@Param("status") RequestStatus status,
                                 @Param("category") ProductCategory category,
                                 @Param("region") String region);

    @Query("""
            select r from ProductRequest r
            where r.status = :status
              and r.category = :category
              and r.createdAt >= :since
            """)
    List<ProductRequest> findRecentByStatusAndCategory(@Param("status") RequestStatus status,
                                                       @Param("category") ProductCategory category,
                                                       @Param("since") Instant since);
}
