package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sponsor")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Sponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    @Column(nullable = false)
    private String sponsorName;

    private String category; // e.g. "Lighting", "Mandap", "Sound", "General"

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    private String contact;

    private String notes;
}
