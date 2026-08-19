package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Every expense belongs to a festival YEAR - required, since advance
    // payments (mandap booking, priest, decoration deposits) commonly happen
    // 10-15 days before the festival, before any FestivalDay row exists.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    // Optional: only set when this expense was paid ON one of the actual
    // festival days. Advance/pre-festival expenses leave this null.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id")
    private FestivalDay festivalDay;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false)
    private String category; // e.g. Decoration, Prasadam, Electricity, Sound System

    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String paidTo;

    private String createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
