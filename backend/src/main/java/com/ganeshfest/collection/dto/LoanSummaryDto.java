package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanSummaryDto {
    private Long id;
    private String borrowerName;
    private String borrowerContact;
    private BigDecimal principalAmount;
    private BigDecimal interestRatePercent;
    private String interestPeriodNote;
    private LocalDate loanDate;
    private String status;
    private String notes;
    private BigDecimal totalPrincipalPaid;
    private BigDecimal totalInterestPaid;
    private BigDecimal outstandingPrincipal;
}
