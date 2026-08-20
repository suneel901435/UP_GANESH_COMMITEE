package com.ganeshfest.collection.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FestivalDayOverviewDto {
    private Long dayId;
    private LocalDate date;
    private Integer dayNumber;
    private String label;
    private List<ProgramSummaryDto> programs;
    private List<AnnadanamSummaryDto> annadanamSponsors;
}
