package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaderboardEntryDto {
    private String name;
    private BigDecimal amount;
    private String type;     // "Sponsor" or "Donor"
    private String category; // sponsor category, or null for aggregated donors
}
