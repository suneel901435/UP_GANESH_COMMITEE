package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FundSummaryDto {
    private BigDecimal totalOpeningBalanceEntered; // historical carry-forward entered when digitizing
    private BigDecimal totalCollectionAllYears;
    private BigDecimal totalExpenseAllYears;
    private BigDecimal netFestivalSurplusAllYears;

    private BigDecimal totalPrincipalLent;
    private BigDecimal totalPrincipalRepaid;
    private BigDecimal totalInterestReceived;
    private BigDecimal outstandingPrincipalWithVillagers;
    private BigDecimal outstandingInterestWithVillagers;

    private BigDecimal availableFundInHand; // the bottom line: cash actually available with the committee right now

    private List<YearFinanceDto> years;
}
