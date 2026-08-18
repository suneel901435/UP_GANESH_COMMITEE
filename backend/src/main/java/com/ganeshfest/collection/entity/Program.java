package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id")
    private FestivalDay festivalDay; // nullable - some programs span whole festival

    @Column(nullable = false)
    private String name;

    private String description;

    private String timeSlot; // e.g. "7:00 PM - 9:00 PM"
}
