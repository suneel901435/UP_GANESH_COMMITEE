package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.DonationCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DonationCollectionRepository extends JpaRepository<DonationCollection, Long> {

    List<DonationCollection> findByFestivalDayIdOrderByTransactionDateDescCreatedAtDesc(Long festivalDayId);

    List<DonationCollection> findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(Long festivalYearId);

    // Entries not tied to any specific festival day - i.e. pre/post-festival collections
    List<DonationCollection> findByFestivalYearIdAndFestivalDayIsNullOrderByTransactionDateDesc(Long festivalYearId);

    // Every collection on one exact date, regardless of whether that date is
    // one of the registered festival days - this is what the daily ledger uses.
    List<DonationCollection> findByFestivalYearIdAndTransactionDateOrderByCreatedAtDesc(Long festivalYearId, LocalDate date);

    @Query("SELECT DISTINCT c.transactionDate FROM DonationCollection c WHERE c.festivalYear.id = :yearId")
    List<LocalDate> distinctDatesForYear(@Param("yearId") Long yearId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DonationCollection c WHERE c.festivalDay.id = :dayId")
    BigDecimal sumByDayId(@Param("dayId") Long dayId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DonationCollection c WHERE c.festivalYear.id = :yearId")
    BigDecimal sumByYearId(@Param("yearId") Long yearId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DonationCollection c WHERE c.festivalYear.id = :yearId AND c.transactionDate = :date")
    BigDecimal sumByYearIdAndDate(@Param("yearId") Long yearId, @Param("date") LocalDate date);
}
