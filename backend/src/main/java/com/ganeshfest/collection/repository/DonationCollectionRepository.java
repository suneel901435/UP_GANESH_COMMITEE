package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.DonationCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface DonationCollectionRepository extends JpaRepository<DonationCollection, Long> {

    List<DonationCollection> findByFestivalDayIdOrderByCreatedAtDesc(Long festivalDayId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DonationCollection c WHERE c.festivalDay.id = :dayId")
    BigDecimal sumByDayId(@Param("dayId") Long dayId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DonationCollection c WHERE c.festivalDay.festivalYear.id = :yearId")
    BigDecimal sumByYearId(@Param("yearId") Long yearId);
}
