package com.ganeshfest.collection.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_repayment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanRepayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @Column(nullable = false)
    private LocalDate paymentDate;

    // Portion of this payment that reduces the outstanding principal
    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal principalPaid = BigDecimal.ZERO;

    // Portion of this payment that is interest (vaddi) - pure income for the fund
    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal interestPaid = BigDecimal.ZERO;

    private String notes;

    private String createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
