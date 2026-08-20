package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Admin-managed lookup list for the Sponsors "category" dropdown, e.g.
 * vigraha_data (Vigraha/Idol), laddu_data (Laddu/Prasadam), mandap_data, etc.
 * Deliberately NOT a foreign key on Sponsor - Sponsor.category stores the
 * categoryKey as a plain string, so deleting a category here never breaks
 * existing sponsor rows (they just keep whatever string they already had).
 */
@Entity
@Table(name = "sponsor_category")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SponsorCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Machine key stored on Sponsor.category, e.g. "vigraha_data". Lowercase,
    // underscore-separated by convention, kept unique so the dropdown never
    // shows two entries that collide.
    @Column(nullable = false, unique = true)
    private String categoryKey;

    // Human-friendly label shown in the dropdown, e.g. "Vigraha (Idol)".
    @Column(nullable = false)
    private String categoryLabel;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
