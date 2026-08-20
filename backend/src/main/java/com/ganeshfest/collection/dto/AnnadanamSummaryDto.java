package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnadanamSummaryDto {
    private Long id;
    private String sponsorName;
    private String contact;
    private Integer mealCount;
    private BigDecimal amount;
    private String notes;
}
