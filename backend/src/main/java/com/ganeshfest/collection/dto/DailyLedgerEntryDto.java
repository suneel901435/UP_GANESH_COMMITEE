package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyLedgerEntryDto {
    private LocalDate date;
    private String festivalDayLabel; // e.g. "Day 2" - null if this date isn't one of the registered festival days
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal balance;
}
