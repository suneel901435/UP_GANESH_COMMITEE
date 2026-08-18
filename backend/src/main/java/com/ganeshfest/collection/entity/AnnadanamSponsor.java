package com.ganeshfest.collection.entity;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

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
