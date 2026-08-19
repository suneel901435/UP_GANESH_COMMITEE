package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "festival_year")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FestivalYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer year;

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private Boolean active = true;

    // Amount carried forward from all previous years combined (manually entered
    // once, the year you start digitizing). This year's "fund available" total
    // = openingBalance + this year's collections - this year's expenses.
    @Builder.Default
    @Column(precision = 12, scale = 2)
    private java.math.BigDecimal openingBalance = java.math.BigDecimal.ZERO;

    // Excluded from JSON: FestivalDay.festivalYear points back here, which would
    // otherwise cause infinite recursion whenever a FestivalYear gets serialized
    // (e.g. GET /api/public/years, or nested inside Program/Sponsor/etc).
    // Fetch a year's days via GET /api/public/years/{year}/day-list instead.
    @JsonIgnore
    @OneToMany(mappedBy = "festivalYear", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FestivalDay> days = new java.util.ArrayList<>();
}
