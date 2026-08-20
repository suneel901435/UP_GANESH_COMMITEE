package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ganeshfest.collection.enums.PaymentMode;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_collection")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonationCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Every collection belongs to a festival YEAR - this is required, since
    // collections routinely start 10-15 days before the festival itself, long
    // before any FestivalDay row exists.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_year_id", nullable = false)
    private FestivalYear festivalYear;

    // Optional: only set when this donation was collected ON one of the actual
    // festival days (so it shows up in the day-wise ledger). Pre-festival or
    // post-festival collections leave this null and just carry a transactionDate.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id")
    private FestivalDay festivalDay;

    // When the money actually came in - independent of festivalDay, so
    // pre-festival collection drives (common 10-15 days before Chaturthi) work
    // the same way as collections taken during the festival itself.
    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false)
    private String donorName;

    private String donorContact;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode;

    private String notes;

    // Opt-in flag: whether this donor consents to appearing on the public
    // donor leaderboard / recognition page. Defaults to true; committee can
    // untick it per-entry for donors who prefer to stay anonymous.
    @Builder.Default
    private Boolean isPublic = true;

    private String createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
