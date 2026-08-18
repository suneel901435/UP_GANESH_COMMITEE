package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DayFinanceDto {
    private Long dayId;
    private LocalDate date;
    private Integer dayNumber;
    private String label;
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal balance;
}
