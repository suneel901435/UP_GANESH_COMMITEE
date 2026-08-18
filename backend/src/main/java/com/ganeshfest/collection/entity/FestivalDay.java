package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "festival_day", uniqueConstraints = @UniqueConstraint(columnNames = {"festival_year_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FestivalDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer dayNumber;

    private String label; // e.g. "Chaturthi", "Ganesh Visarjan"
}
