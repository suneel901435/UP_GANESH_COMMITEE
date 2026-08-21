package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.Sponsor;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.SponsorRepository;
import com.ganeshfest.collection.service.AuditLogService;
import com.ganeshfest.collection.util.AuditChangeBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/sponsors")
public class AdminSponsorController {

    private final SponsorRepository sponsorRepo;
    private final FestivalYearRepository yearRepo;
    private final AuditLogService auditLogService;

    public AdminSponsorController(SponsorRepository sponsorRepo, FestivalYearRepository yearRepo, AuditLogService auditLogService) {
        this.sponsorRepo = sponsorRepo;
        this.yearRepo = yearRepo;
        this.auditLogService = auditLogService;
    }

    public static class SponsorRequest {
        public Long festivalYearId;
        public String sponsorName;
        public String category;
        public java.math.BigDecimal amount;
        public String contact;
        public String notes;
        public Boolean isPublic; // opt-in flag for the public donor leaderboard
    }

    @PostMapping
    public ResponseEntity<Sponsor> create(@RequestBody SponsorRequest req, Authentication auth) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        Sponsor s = Sponsor.builder()
                .festivalYear(fy)
                .sponsorName(req.sponsorName)
                .category(req.category)
                .amount(req.amount)
                .contact(req.contact)
                .notes(req.notes)
                .isPublic(req.isPublic == null || req.isPublic)
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();
        Sponsor saved = sponsorRepo.save(s);
        auditLogService.logCreate("Sponsor", saved.getId(), saved.getSponsorName(), saved.getAmount(), fy.getYear(), auth);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sponsor> update(@PathVariable Long id, @RequestBody SponsorRequest req, Authentication auth) {
        Sponsor s = sponsorRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        AuditChangeBuilder diff = new AuditChangeBuilder()
                .track("Sponsor", s.getSponsorName(), req.sponsorName)
                .track("Category", s.getCategory(), req.category)
                .track("Amount", s.getAmount(), req.amount)
                .track("Contact", s.getContact(), req.contact)
                .track("Notes", s.getNotes(), req.notes);

        s.setSponsorName(req.sponsorName);
        s.setCategory(req.category);
        s.setAmount(req.amount);
        s.setContact(req.contact);
        s.setNotes(req.notes);
        if (req.isPublic != null) s.setIsPublic(req.isPublic);
        Sponsor saved = sponsorRepo.save(s);
        auditLogService.logUpdate("Sponsor", saved.getId(), saved.getSponsorName(), saved.getAmount(),
                saved.getFestivalYear().getYear(), diff.build(), auth);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        Sponsor s = sponsorRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        auditLogService.logDelete("Sponsor", s.getId(), s.getSponsorName(), s.getAmount(), s.getFestivalYear().getYear(), auth);
        sponsorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
