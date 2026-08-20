package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.Sponsor;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.SponsorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/sponsors")
public class AdminSponsorController {

    private final SponsorRepository sponsorRepo;
    private final FestivalYearRepository yearRepo;

    public AdminSponsorController(SponsorRepository sponsorRepo, FestivalYearRepository yearRepo) {
        this.sponsorRepo = sponsorRepo;
        this.yearRepo = yearRepo;
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
        return ResponseEntity.ok(sponsorRepo.save(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sponsor> update(@PathVariable Long id, @RequestBody SponsorRequest req) {
        Sponsor s = sponsorRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        s.setSponsorName(req.sponsorName);
        s.setCategory(req.category);
        s.setAmount(req.amount);
        s.setContact(req.contact);
        s.setNotes(req.notes);
        if (req.isPublic != null) s.setIsPublic(req.isPublic);
        return ResponseEntity.ok(sponsorRepo.save(s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sponsorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
