package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.FestivalYear;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FestivalYearRepository extends JpaRepository<FestivalYear, Long> {
    Optional<FestivalYear> findByYear(Integer year);
}
