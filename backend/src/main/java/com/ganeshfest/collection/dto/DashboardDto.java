package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardDto {
    private Integer year;

    // This year's numbers
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private BigDecimal yearSurplus;       // totalCollection - totalExpense

    // Carried forward + this year
    private BigDecimal openingBalance;    // brought forward from before digitizing
    private BigDecimal fundAvailable;     // openingBalance + yearSurplus (before lending)

    // Village lending (vaddi) - fund-wide, not year-scoped
    private BigDecimal totalPrincipalLent;      // sum of all loan principal ever given out
    private BigDecimal totalPrincipalRecovered; // sum of all principal repaid
    private BigDecimal totalInterestEarned;     // sum of all interest (vaddi) collected
    private BigDecimal outstandingPrincipal;    // totalPrincipalLent - totalPrincipalRecovered

    // The actual cash the committee is physically holding right now
    private BigDecimal cashInHand;        // fundAvailable - outstandingPrincipal + totalInterestEarned

    private Integer totalDonors;
    private Integer daysCount;
}
