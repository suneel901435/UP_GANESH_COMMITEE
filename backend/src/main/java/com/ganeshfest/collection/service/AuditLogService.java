package com.ganeshfest.collection.service;

import com.ganeshfest.collection.entity.AuditLog;
import com.ganeshfest.collection.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepo;

    public AuditLogService(AuditLogRepository auditLogRepo) {
        this.auditLogRepo = auditLogRepo;
    }

    private String who(Authentication auth) {
        return auth != null && auth.getName() != null ? auth.getName() : "admin";
    }

    public void logCreate(String module, Long entityId, String summary, BigDecimal amount, Integer festivalYear, Authentication auth) {
        save(module, "CREATE", entityId, summary, amount, festivalYear, null, auth);
    }

    /** No-op if changes is null/blank - an update that didn't actually change anything isn't worth a row. */
    public void logUpdate(String module, Long entityId, String summary, BigDecimal amount, Integer festivalYear, String changes, Authentication auth) {
        if (changes == null || changes.isBlank()) return;
        save(module, "UPDATE", entityId, summary, amount, festivalYear, changes, auth);
    }

    public void logDelete(String module, Long entityId, String summary, BigDecimal amount, Integer festivalYear, Authentication auth) {
        save(module, "DELETE", entityId, summary, amount, festivalYear, null, auth);
    }

    private void save(String module, String action, Long entityId, String summary, BigDecimal amount,
                       Integer festivalYear, String changes, Authentication auth) {
        AuditLog entry = AuditLog.builder()
                .module(module)
                .action(action)
                .entityId(entityId)
                .summary(summary)
                .amount(amount)
                .festivalYear(festivalYear)
                .changes(changes)
                .performedBy(who(auth))
                .build();
        auditLogRepo.save(entry);
    }
}
