package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByFestivalDayIdOrderByTransactionDateDescCreatedAtDesc(Long festivalDayId);

    List<Expense> findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(Long festivalYearId);

    List<Expense> findByFestivalYearIdAndFestivalDayIsNullOrderByTransactionDateDesc(Long festivalYearId);

    List<Expense> findByFestivalYearIdAndTransactionDateOrderByCreatedAtDesc(Long festivalYearId, LocalDate date);

    @Query("SELECT DISTINCT e.transactionDate FROM Expense e WHERE e.festivalYear.id = :yearId")
    List<LocalDate> distinctDatesForYear(@Param("yearId") Long yearId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.festivalDay.id = :dayId")
    BigDecimal sumByDayId(@Param("dayId") Long dayId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.festivalYear.id = :yearId")
    BigDecimal sumByYearId(@Param("yearId") Long yearId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.festivalYear.id = :yearId AND e.transactionDate = :date")
    BigDecimal sumByYearIdAndDate(@Param("yearId") Long yearId, @Param("date") LocalDate date);
}
