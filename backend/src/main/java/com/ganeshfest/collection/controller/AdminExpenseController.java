package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.Expense;
import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.ExpenseRepository;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/expenses")
public class AdminExpenseController {

    private final ExpenseRepository expenseRepo;
    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;

    public AdminExpenseController(ExpenseRepository expenseRepo, FestivalYearRepository yearRepo, FestivalDayRepository dayRepo) {
        this.expenseRepo = expenseRepo;
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
    }

    public static class ExpenseRequest {
        public Long festivalYearId;      // required
        public String transactionDate;   // required, ISO format e.g. 2026-08-20 - defaults to today on the frontend
        public String category;
        public String description;
        public java.math.BigDecimal amount;
        public String paidTo;
        // No festivalDayId here on purpose - see AdminCollectionController for why.
    }

    private FestivalDay autoDetectFestivalDay(Long festivalYearId, LocalDate date) {
        return dayRepo.findByFestivalYearIdAndDate(festivalYearId, date).orElse(null);
    }

    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody ExpenseRequest req, Authentication auth) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId)
                .orElseThrow(() -> new RuntimeException("Festival year not found"));
        LocalDate date = LocalDate.parse(req.transactionDate);
        FestivalDay day = autoDetectFestivalDay(fy.getId(), date);

        Expense e = Expense.builder()
                .festivalYear(fy)
                .festivalDay(day)
                .transactionDate(date)
                .category(req.category)
                .description(req.description)
                .amount(req.amount)
                .paidTo(req.paidTo)
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();

        return ResponseEntity.ok(expenseRepo.save(e));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @RequestBody ExpenseRequest req) {
        Expense e = expenseRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        e.setCategory(req.category);
        e.setDescription(req.description);
        e.setAmount(req.amount);
        e.setPaidTo(req.paidTo);
        if (req.transactionDate != null) {
            LocalDate date = LocalDate.parse(req.transactionDate);
            e.setTransactionDate(date);
            Long yearId = req.festivalYearId != null ? req.festivalYearId : e.getFestivalYear().getId();
            e.setFestivalDay(autoDetectFestivalDay(yearId, date));
        }
        return ResponseEntity.ok(expenseRepo.save(e));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expenseRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
