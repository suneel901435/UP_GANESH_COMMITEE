package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ganeshfest.collection.enums.GalleryCategory;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gallery_photo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Excluded from JSON: lazy proxy, not read directly by the frontend.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private GalleryCategory category = GalleryCategory.FESTIVAL;

    private String caption;

    @Column(nullable = false)
    private String imageUrl;

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
