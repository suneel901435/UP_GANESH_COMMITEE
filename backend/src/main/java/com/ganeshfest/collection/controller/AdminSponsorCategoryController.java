package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.SponsorCategory;
import com.ganeshfest.collection.repository.SponsorCategoryRepository;
import com.ganeshfest.collection.repository.SponsorRepository;
import com.ganeshfest.collection.service.AuditLogService;
import com.ganeshfest.collection.util.AuditChangeBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only CRUD for the Sponsor Category lookup list (e.g. vigraha_data,
 * laddu_data). ManageSponsors.jsx reads GET / to populate the category
 * dropdown; this controller is where admins add/update/delete the options
 * that appear in it.
 */
@RestController
@RequestMapping("/api/admin/sponsor-categories")
public class AdminSponsorCategoryController {

    private final SponsorCategoryRepository categoryRepo;
    private final SponsorRepository sponsorRepo;
    private final AuditLogService auditLogService;

    public AdminSponsorCategoryController(SponsorCategoryRepository categoryRepo, SponsorRepository sponsorRepo, AuditLogService auditLogService) {
        this.categoryRepo = categoryRepo;
        this.sponsorRepo = sponsorRepo;
        this.auditLogService = auditLogService;
    }

    public static class SponsorCategoryRequest {
        public String categoryKey;     // e.g. "vigraha_data"
        public String categoryLabel;   // e.g. "Vigraha (Idol)"
        public Boolean active;
        public Integer sortOrder;
    }

    private String normalizeKey(String raw) {
        if (raw == null) return null;
        return raw.trim().toLowerCase().replaceAll("[^a-z0-9]+", "_").replaceAll("^_+|_+$", "");
    }

    @GetMapping
    public List<SponsorCategory> list() {
        return categoryRepo.findAllByOrderBySortOrderAscCategoryLabelAsc();
    }

    @PostMapping
    public ResponseEntity<SponsorCategory> create(@RequestBody SponsorCategoryRequest req, Authentication auth) {
        if (req.categoryLabel == null || req.categoryLabel.isBlank()) {
            throw new RuntimeException("Please enter a category name.");
        }
        String key = normalizeKey(req.categoryKey != null && !req.categoryKey.isBlank() ? req.categoryKey : req.categoryLabel);
        if (key == null || key.isBlank()) {
            throw new RuntimeException("Please enter a valid category name.");
        }
        if (categoryRepo.existsByCategoryKeyIgnoreCase(key)) {
            throw new RuntimeException("A category with that key already exists.");
        }

        SponsorCategory category = SponsorCategory.builder()
                .categoryKey(key)
                .categoryLabel(req.categoryLabel.trim())
                .active(req.active == null || req.active)
                .sortOrder(req.sortOrder != null ? req.sortOrder : 0)
                .build();

        SponsorCategory saved = categoryRepo.save(category);
        auditLogService.logCreate("Sponsor Category", saved.getId(), saved.getCategoryLabel(), null, null, auth);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SponsorCategory> update(@PathVariable Long id, @RequestBody SponsorCategoryRequest req, Authentication auth) {
        SponsorCategory category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        AuditChangeBuilder diff = new AuditChangeBuilder()
                .track("Label", category.getCategoryLabel(), req.categoryLabel)
                .track("Key", category.getCategoryKey(), req.categoryKey)
                .track("Active", category.getActive(), req.active)
                .track("Sort Order", category.getSortOrder(), req.sortOrder);

        if (req.categoryLabel != null && !req.categoryLabel.isBlank()) {
            category.setCategoryLabel(req.categoryLabel.trim());
        }
        if (req.categoryKey != null && !req.categoryKey.isBlank()) {
            String key = normalizeKey(req.categoryKey);
            if (categoryRepo.existsByCategoryKeyIgnoreCaseAndIdNot(key, id)) {
                throw new RuntimeException("A category with that key already exists.");
            }
            category.setCategoryKey(key);
        }
        if (req.active != null) category.setActive(req.active);
        if (req.sortOrder != null) category.setSortOrder(req.sortOrder);

        SponsorCategory saved = categoryRepo.save(category);
        auditLogService.logUpdate("Sponsor Category", saved.getId(), saved.getCategoryLabel(), null, null, diff.build(), auth);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        SponsorCategory category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Not a hard block - existing sponsors keep their stored category
        // string either way - just a heads-up so an admin doesn't accidentally
        // remove a category that's still actively in use, hiding it from the
        // dropdown for future entries without meaning to.
        long usageCount = sponsorRepo.countByCategory(category.getCategoryKey());

        auditLogService.logDelete("Sponsor Category", category.getId(), category.getCategoryLabel(), null, null, auth);
        categoryRepo.deleteById(id);
        return ResponseEntity.ok().body(java.util.Map.of(
                "deleted", true,
                "sponsorsUsingThisCategory", usageCount
        ));
    }
}
