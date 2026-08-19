package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class YearFinanceDto {
    private Integer year;
    private BigDecimal openingBalance;
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal netSurplus;
}
