package com.ganeshfest.collection.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditEntryDto {
    private String entityType;   // "Collection" or "Expense"
    private Long entityId;
    private String action;       // "Added" (only creations are tracked today - see AdminAuditController)
    private String summary;      // human-readable one-liner, e.g. "Donation from Ramesh - Rs 500"
    private BigDecimal amount;
    private String createdBy;
    private LocalDateTime createdAt;
}
