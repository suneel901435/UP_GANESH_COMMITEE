package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DateDetailDto {
    private LocalDate date;
    private String festivalDayLabel; // null if this date isn't one of the registered festival days
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CollectionEntryDto> collections;
    private List<ExpenseEntryDto> expenses;
}
