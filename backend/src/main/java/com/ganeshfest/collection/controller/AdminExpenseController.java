package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.Expense;
import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.repository.ExpenseRepository;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/expenses")
public class AdminExpenseController {

    private final ExpenseRepository expenseRepo;
    private final FestivalDayRepository dayRepo;

    public AdminExpenseController(ExpenseRepository expenseRepo, FestivalDayRepository dayRepo) {
        this.expenseRepo = expenseRepo;
        this.dayRepo = dayRepo;
    }

    public static class ExpenseRequest {
        public Long festivalDayId;
        public String category;
        public String description;
        public java.math.BigDecimal amount;
        public String paidTo;
    }

    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody ExpenseRequest req, Authentication auth) {
        FestivalDay day = dayRepo.findById(req.festivalDayId)
                .orElseThrow(() -> new RuntimeException("Festival day not found"));

        Expense e = Expense.builder()
                .festivalDay(day)
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
        return ResponseEntity.ok(expenseRepo.save(e));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expenseRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
