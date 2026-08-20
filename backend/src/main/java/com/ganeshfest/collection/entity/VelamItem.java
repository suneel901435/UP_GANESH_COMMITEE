package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ganeshfest.collection.enums.VelamStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "velam_item")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VelamItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Excluded from JSON: lazy proxy, not read directly by the frontend.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    @Column(nullable = false)
    private String itemName;

    private String description;

    @Column(precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal finalPrice;

    private String buyerName;

    private String buyerContact;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VelamStatus status = VelamStatus.AVAILABLE;

    private String imageUrl;
}
