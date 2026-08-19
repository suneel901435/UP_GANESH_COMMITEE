package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "annadanam_sponsor")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnadanamSponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Excluded from JSON: lazy proxy, not read directly by the frontend.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    // Kept in JSON - AnnadanamSponsors.jsx groups by festivalDay.dayNumber / .date.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id", nullable = false)
    private FestivalDay festivalDay;

    @Column(nullable = false)
    private String sponsorName;

    private String contact;

    private Integer mealCount;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    private String notes;
}
