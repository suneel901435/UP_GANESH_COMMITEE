package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One row per admin action (create/update/delete) across every module -
 * Collection, Expense, Sponsor, Sponsor Category, Program, Annadanam,
 * Velam Paata, Village Lending. This is the real audit trail: unlike the old
 * approach of reading createdBy/createdAt off DonationCollection/Expense
 * (which only ever showed creations), every controller now writes a row here
 * on every add, edit, and delete, via AuditLogService.
 */
@Entity
@Table(name = "audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which feature this change belongs to, e.g. "Collection", "Expense",
    // "Sponsor", "Sponsor Category", "Program", "Annadanam", "Velam Paata",
    // "Village Lending". Drives the module filter on the Audit Trail page.
    @Column(nullable = false)
    private String module;

    // The id of the row that was created/updated/deleted, in its own table.
    private Long entityId;

    // CREATE / UPDATE / DELETE
    @Column(nullable = false)
    private String action;

    // Human-readable one-liner, e.g. "Donation from Ramesh"
    private String summary;

    // Only populated for UPDATE - a short "field: old -> new; field: old -> new" list,
    // built by AuditChangeBuilder from the before/after values in each controller.
    @Column(length = 2000)
    private String changes;

    private BigDecimal amount;

    // Festival year this change relates to, when the module is year-scoped.
    // Null for year-independent modules like Village Lending / Sponsor Category.
    private Integer festivalYear;

    private String performedBy;

    @Builder.Default
    private LocalDateTime performedAt = LocalDateTime.now();
}
