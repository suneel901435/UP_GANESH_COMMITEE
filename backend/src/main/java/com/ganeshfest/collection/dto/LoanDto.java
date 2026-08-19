package com.ganeshfest.collection.dto;

import com.ganeshfest.collection.enums.LoanStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanDto {
    private Long id;
    private String borrowerName;
    private String borrowerContact;
    private BigDecimal principalAmount;
    private BigDecimal interestRatePerHundredPerMonth;
    private LocalDate loanDate;
    private LocalDate closedDate;
    private LoanStatus status;
    private String notes;
    private Integer yearLentIn; // festival year this was lent from, if set

    // computed
    private Integer monthsElapsed;
    private BigDecimal principalPaid;
    private BigDecimal interestPaid;
    private BigDecimal outstandingPrincipal;
    private BigDecimal interestAccrued;   // total interest owed so far (flat, on original principal)
    private BigDecimal interestDue;       // interestAccrued - interestPaid
    private BigDecimal totalDue;          // outstandingPrincipal + interestDue

    private List<com.ganeshfest.collection.entity.LoanRepayment> repayments;
}
