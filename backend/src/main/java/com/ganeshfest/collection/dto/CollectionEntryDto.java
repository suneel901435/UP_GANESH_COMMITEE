package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CollectionEntryDto {
    private Long id;
    private String donorName;
    private String donorContact;
    private BigDecimal amount;
    private String paymentMode;
    private String notes;
    private LocalDate transactionDate;
    private String festivalDayLabel; // e.g. "Day 2" - null if collected outside the festival days
}
