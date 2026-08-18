package com.ganeshfest.collection.entity;

import com.ganeshfest.collection.enums.PaymentMode;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_collection")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonationCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_day_id", nullable = false)
    private FestivalDay festivalDay;

    @Column(nullable = false)
    private String donorName;

    private String donorContact;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode;

    private String notes;

    private String createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
