package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // Excluded from JSON: lazy proxy, not read directly by the frontend.
    @JsonIgnore
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

    // Opt-in flag: whether this sponsor consents to appearing on the public
    // donor leaderboard / recognition page. Defaults to true so existing rows
    // (and normal new entries) show up unless an admin explicitly hides them.
    @Builder.Default
    private Boolean isPublic = true;

    private String createdBy;

    @Builder.Default
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
