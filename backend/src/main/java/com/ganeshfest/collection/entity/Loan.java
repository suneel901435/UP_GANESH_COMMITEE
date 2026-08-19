package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ganeshfest.collection.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Village lending (vaddi) - the committee lends out part of the surplus fund
 * to villagers at interest, tracked here independent of any single festival
 * year (it's one running fund, built up over years).
 *
 * interestRatePercent is stored as "rupees per 100 principal" - e.g. 2.00
 * means 2 rupees per 100 rupees principal. The period this rate applies to
 * (per month, per year, etc.) is a local custom the committee already knows,
 * so it isn't assumed here - record it in `interestPeriodNote` for clarity
 * (e.g. "2% per month").
 */
@Entity
@Table(name = "loan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String borrowerName;

    private String borrowerContact;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal principalAmount;

    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal interestRatePercent = new BigDecimal("2.00"); // ₹2 per ₹100 by default

    private String interestPeriodNote; // e.g. "per month" - free text, committee's own convention

    @Column(nullable = false)
    private LocalDate loanDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;

    private String notes;

    private String createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LoanRepayment> repayments = new java.util.ArrayList<>();
}
