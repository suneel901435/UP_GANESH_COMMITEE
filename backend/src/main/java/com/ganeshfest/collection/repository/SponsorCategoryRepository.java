package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.SponsorCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SponsorCategoryRepository extends JpaRepository<SponsorCategory, Long> {
    List<SponsorCategory> findAllByOrderBySortOrderAscCategoryLabelAsc();
    Optional<SponsorCategory> findByCategoryKeyIgnoreCase(String categoryKey);
    boolean existsByCategoryKeyIgnoreCase(String categoryKey);
    boolean existsByCategoryKeyIgnoreCaseAndIdNot(String categoryKey, Long id);
}
