package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    List<Sponsor> findByFestivalYearIdOrderByIdAsc(Long festivalYearId);
    long countByFestivalYearId(Long festivalYearId);
    long countByCategory(String category);
}
