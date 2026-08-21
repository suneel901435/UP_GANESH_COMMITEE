package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.AnnadanamSponsor;
import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.AnnadanamSponsorRepository;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.service.AuditLogService;
import com.ganeshfest.collection.util.AuditChangeBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/annadanam-sponsors")
public class AdminAnnadanamController {

    private final AnnadanamSponsorRepository annadanamRepo;
    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;
    private final AuditLogService auditLogService;

    public AdminAnnadanamController(AnnadanamSponsorRepository annadanamRepo, FestivalYearRepository yearRepo,
                                     FestivalDayRepository dayRepo, AuditLogService auditLogService) {
        this.annadanamRepo = annadanamRepo;
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
        this.auditLogService = auditLogService;
    }

    public static class AnnadanamRequest {
        public Long festivalYearId;
        public Long festivalDayId;
        public String sponsorName;
        public String contact;
        public Integer mealCount;
        public java.math.BigDecimal amount;
        public String notes;
    }

    @PostMapping
    public ResponseEntity<AnnadanamSponsor> create(@RequestBody AnnadanamRequest req, Authentication auth) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        FestivalDay day = dayRepo.findById(req.festivalDayId).orElseThrow(() -> new RuntimeException("Day not found"));

        AnnadanamSponsor a = AnnadanamSponsor.builder()
                .festivalYear(fy)
                .festivalDay(day)
                .sponsorName(req.sponsorName)
                .contact(req.contact)
                .mealCount(req.mealCount)
                .amount(req.amount)
                .notes(req.notes)
                .build();

        AnnadanamSponsor saved = annadanamRepo.save(a);
        auditLogService.logCreate("Annadanam", saved.getId(), saved.getSponsorName(), saved.getAmount(), fy.getYear(), auth);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnadanamSponsor> update(@PathVariable Long id, @RequestBody AnnadanamRequest req, Authentication auth) {
        AnnadanamSponsor a = annadanamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        AuditChangeBuilder diff = new AuditChangeBuilder()
                .track("Sponsor", a.getSponsorName(), req.sponsorName)
                .track("Amount", a.getAmount(), req.amount)
                .track("Meal Count", a.getMealCount(), req.mealCount)
                .track("Contact", a.getContact(), req.contact)
                .track("Notes", a.getNotes(), req.notes);

        a.setSponsorName(req.sponsorName);
        a.setContact(req.contact);
        a.setMealCount(req.mealCount);
        a.setAmount(req.amount);
        a.setNotes(req.notes);
        if (req.festivalDayId != null) {
            a.setFestivalDay(dayRepo.findById(req.festivalDayId).orElse(a.getFestivalDay()));
        }
        AnnadanamSponsor saved = annadanamRepo.save(a);
        auditLogService.logUpdate("Annadanam", saved.getId(), saved.getSponsorName(), saved.getAmount(),
                saved.getFestivalYear().getYear(), diff.build(), auth);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        AnnadanamSponsor a = annadanamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        auditLogService.logDelete("Annadanam", a.getId(), a.getSponsorName(), a.getAmount(), a.getFestivalYear().getYear(), auth);
        annadanamRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
