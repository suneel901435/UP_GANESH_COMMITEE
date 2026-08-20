package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.AuditEntryDto;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.DonationCollectionRepository;
import com.ganeshfest.collection.repository.ExpenseRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Surfaces the createdBy/createdAt trail that DonationCollection and Expense
 * already store on every row, as one combined "who added what, when" log for
 * the committee. Read-only, admin-only (covered by SecurityConfig's
 * /api/admin/** rule) - this is not a full change-history (edits/deletes
 * aren't tracked separately, only original entry), but it's enough to answer
 * "who recorded this donation/expense and when" for audit purposes.
 */
@RestController
@RequestMapping("/api/admin/audit")
public class AdminAuditController {

    private final DonationCollectionRepository collectionRepo;
    private final ExpenseRepository expenseRepo;
    private final FestivalYearRepository yearRepo;

    public AdminAuditController(DonationCollectionRepository collectionRepo, ExpenseRepository expenseRepo,
                                 FestivalYearRepository yearRepo) {
        this.collectionRepo = collectionRepo;
        this.expenseRepo = expenseRepo;
        this.yearRepo = yearRepo;
    }

    @GetMapping("/years/{year}")
    public List<AuditEntryDto> auditLog(@PathVariable Integer year) {
        FestivalYear fy = yearRepo.findByYear(year)
                .orElseThrow(() -> new RuntimeException("No festival data found for year " + year));

        List<AuditEntryDto> entries = new ArrayList<>();

        collectionRepo.findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(fy.getId()).forEach(c ->
                entries.add(AuditEntryDto.builder()
                        .entityType("Collection")
                        .entityId(c.getId())
                        .action("Added")
                        .summary("Donation from " + c.getDonorName())
                        .amount(c.getAmount())
                        .createdBy(c.getCreatedBy() != null ? c.getCreatedBy() : "—")
                        .createdAt(c.getCreatedAt())
                        .build())
        );

        expenseRepo.findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(fy.getId()).forEach(e ->
                entries.add(AuditEntryDto.builder()
                        .entityType("Expense")
                        .entityId(e.getId())
                        .action("Added")
                        .summary(e.getCategory() + (e.getPaidTo() != null && !e.getPaidTo().isBlank() ? " - paid to " + e.getPaidTo() : ""))
                        .amount(e.getAmount())
                        .createdBy(e.getCreatedBy() != null ? e.getCreatedBy() : "—")
                        .createdAt(e.getCreatedAt())
                        .build())
        );

        return entries.stream()
                .sorted(Comparator.comparing(AuditEntryDto::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }
}
