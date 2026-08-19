package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DayDetailDto {
    private Long dayId;
    private LocalDate date;
    private Integer dayNumber;
    private String label;
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CollectionEntryDto> collections;
    private List<ExpenseEntryDto> expenses;
}
