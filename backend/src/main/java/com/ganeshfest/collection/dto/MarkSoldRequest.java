package com.ganeshfest.collection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MarkSoldRequest {
    @NotBlank
    private String buyerName;

    private String buyerContact;

    @NotNull
    private BigDecimal finalPrice;
}
