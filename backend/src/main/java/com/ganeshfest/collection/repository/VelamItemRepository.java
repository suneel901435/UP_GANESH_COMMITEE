package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.VelamItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VelamItemRepository extends JpaRepository<VelamItem, Long> {
    List<VelamItem> findByFestivalYearIdOrderByIdAsc(Long festivalYearId);
}
