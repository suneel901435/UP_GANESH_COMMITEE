package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id", nullable = false)
    private FestivalDay festivalDay;

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
