package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByFestivalDayIdOrderByCreatedAtDesc(Long festivalDayId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.festivalDay.id = :dayId")
    BigDecimal sumByDayId(@Param("dayId") Long dayId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.festivalDay.festivalYear.id = :yearId")
    BigDecimal sumByYearId(@Param("yearId") Long yearId);
}
