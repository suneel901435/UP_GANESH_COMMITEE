package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseEntryDto {
    private Long id;
    private String category;
    private String description;
    private BigDecimal amount;
    private String paidTo;
    private LocalDate transactionDate;
    private String festivalDayLabel; // e.g. "Day 2" - null if paid outside the festival days
}
