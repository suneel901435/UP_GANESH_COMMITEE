package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardDto {
    private Integer year;
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private Integer totalDonors;
    private Integer daysCount;
}
