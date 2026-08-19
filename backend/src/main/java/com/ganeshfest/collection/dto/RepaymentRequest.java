package com.ganeshfest.collection.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RepaymentRequest {
    @NotNull
    private LocalDate paymentDate;

    private BigDecimal principalPaid;
    private BigDecimal interestPaid;
    private String notes;
}
