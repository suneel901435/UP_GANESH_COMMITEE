package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Excluded from JSON: lazy proxy, and the frontend never reads it directly.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    // Kept in JSON - Programs.jsx reads festivalDay.dayNumber / .date. Safe now
    // that FestivalDay.festivalYear is itself @JsonIgnore'd, so there's no
    // further chain to serialize.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id")
    private FestivalDay festivalDay; // nullable - some programs span whole festival

    @Column(nullable = false)
    private String name;

    private String description;

    private String timeSlot; // e.g. "7:00 PM - 9:00 PM"
}
