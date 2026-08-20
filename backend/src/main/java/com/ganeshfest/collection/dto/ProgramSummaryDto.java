package com.ganeshfest.collection.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProgramSummaryDto {
    private Long id;
    private String name;
    private String description;
    private String timeSlot;
}
