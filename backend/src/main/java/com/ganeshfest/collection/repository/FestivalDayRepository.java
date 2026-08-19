package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.FestivalDay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FestivalDayRepository extends JpaRepository<FestivalDay, Long> {
    List<FestivalDay> findByFestivalYearIdOrderByDayNumberAsc(Long festivalYearId);

    // Used to auto-detect whether a collection/expense date falls on an actual
    // festival day, so the admin never has to pick it manually.
    Optional<FestivalDay> findByFestivalYearIdAndDate(Long festivalYearId, LocalDate date);
}
