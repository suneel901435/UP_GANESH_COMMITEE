package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.FestivalDay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FestivalDayRepository extends JpaRepository<FestivalDay, Long> {
    List<FestivalDay> findByFestivalYearIdOrderByDayNumberAsc(Long festivalYearId);
}
