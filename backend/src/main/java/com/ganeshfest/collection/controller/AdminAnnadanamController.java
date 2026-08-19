package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.AnnadanamSponsor;
import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.AnnadanamSponsorRepository;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/annadanam-sponsors")
public class AdminAnnadanamController {

    private final AnnadanamSponsorRepository annadanamRepo;
    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;

    public AdminAnnadanamController(AnnadanamSponsorRepository annadanamRepo, FestivalYearRepository yearRepo, FestivalDayRepository dayRepo) {
        this.annadanamRepo = annadanamRepo;
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
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
    public ResponseEntity<AnnadanamSponsor> create(@RequestBody AnnadanamRequest req) {
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

        return ResponseEntity.ok(annadanamRepo.save(a));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnadanamSponsor> update(@PathVariable Long id, @RequestBody AnnadanamRequest req) {
        AnnadanamSponsor a = annadanamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        a.setSponsorName(req.sponsorName);
        a.setContact(req.contact);
        a.setMealCount(req.mealCount);
        a.setAmount(req.amount);
        a.setNotes(req.notes);
        if (req.festivalDayId != null) {
            a.setFestivalDay(dayRepo.findById(req.festivalDayId).orElse(a.getFestivalDay()));
        }
        return ResponseEntity.ok(annadanamRepo.save(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        annadanamRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
