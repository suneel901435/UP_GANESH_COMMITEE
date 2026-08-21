package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.AuditLog;
import com.ganeshfest.collection.repository.AuditLogRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * The real audit trail: every CREATE/UPDATE/DELETE across every admin module
 * (Collection, Expense, Sponsor, Sponsor Category, Program, Annadanam,
 * Velam Paata, Village Lending) is written here by AuditLogService at the
 * point the change happens - see each Admin*Controller. This controller is
 * just a read/filter layer on top of that table.
 */
@RestController
@RequestMapping("/api/admin/audit")
public class AdminAuditController {

    private final AuditLogRepository auditLogRepo;

    public AdminAuditController(AuditLogRepository auditLogRepo) {
        this.auditLogRepo = auditLogRepo;
    }

    public static class AuditLogDto {
        public Long id;
        public String module;
        public String action;
        public Long entityId;
        public String summary;
        public String changes;
        public BigDecimal amount;
        public Integer festivalYear;
        public String performedBy;
        public LocalDateTime performedAt;
    }

    private AuditLogDto toDto(AuditLog a) {
        AuditLogDto d = new AuditLogDto();
        d.id = a.getId();
        d.module = a.getModule();
        d.action = a.getAction();
        d.entityId = a.getEntityId();
        d.summary = a.getSummary();
        d.changes = a.getChanges();
        d.amount = a.getAmount();
        d.festivalYear = a.getFestivalYear();
        d.performedBy = a.getPerformedBy();
        d.performedAt = a.getPerformedAt();
        return d;
    }

    /**
     * Filterable audit feed. All params optional - "module"/"admin"/"action"
     * of null or "All" mean "don't filter on this field". Powers the filter
     * bar on the Audit Trail admin page.
     */
    @GetMapping
    public List<AuditLogDto> list(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String admin,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Specification<AuditLog> spec = (root, query, cb) -> cb.conjunction();

        if (module != null && !module.isBlank() && !module.equalsIgnoreCase("All")) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("module"), module));
        }
        if (admin != null && !admin.isBlank() && !admin.equalsIgnoreCase("All")) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("performedBy"), admin));
        }
        if (action != null && !action.isBlank() && !action.equalsIgnoreCase("All")) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("action"), action.toUpperCase()));
        }
        if (year != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("festivalYear"), year));
        }
        if (from != null) {
            LocalDateTime fromDt = from.atStartOfDay();
            spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("performedAt"), fromDt));
        }
        if (to != null) {
            LocalDateTime toDt = to.plusDays(1).atStartOfDay();
            spec = spec.and((root, q, cb) -> cb.lessThan(root.get("performedAt"), toDt));
        }

        return auditLogRepo.findAll(spec, Sort.by(Sort.Direction.DESC, "performedAt")).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /** Kept for the existing frontend route (Audit Trail page defaults to the selected festival year). */
    @GetMapping("/years/{year}")
    public List<AuditLogDto> auditLogForYear(@PathVariable Integer year) {
        return list(null, null, null, year, null, null);
    }

    @GetMapping("/modules")
    public List<String> modules() {
        return auditLogRepo.findDistinctModules();
    }

    @GetMapping("/admins")
    public List<String> admins() {
        return auditLogRepo.findDistinctAdmins();
    }
}
