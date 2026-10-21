package com.krushimart.demandgap.repository;

import com.krushimart.demandgap.entity.DemandOpportunity;
import com.krushimart.demandgap.entity.OpportunityStatus;
import com.krushimart.product.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface DemandOpportunityRepository extends JpaRepository<DemandOpportunity, Long> {

    Optional<DemandOpportunity> findByCategoryAndRegionIgnoreCase(ProductCategory category, String region);

    List<DemandOpportunity> findByStatusAndScoreGreaterThanEqualOrderByScoreDesc(
            OpportunityStatus status, BigDecimal score);

    List<DemandOpportunity> findByStatusOrderByScoreDesc(OpportunityStatus status);
}
