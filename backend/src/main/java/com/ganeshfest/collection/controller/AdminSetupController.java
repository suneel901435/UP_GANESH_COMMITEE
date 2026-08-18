package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Set up a festival year and its days. Do this FIRST each year before
 * entering any collections/expenses - everything else hangs off a FestivalDay.
 */
@RestController
@RequestMapping("/api/admin/setup")
public class AdminSetupController {

    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;

    public AdminSetupController(FestivalYearRepository yearRepo, FestivalDayRepository dayRepo) {
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
    }

    @PostMapping("/years")
    public ResponseEntity<FestivalYear> createYear(@Valid @RequestBody FestivalYear year) {
        return ResponseEntity.ok(yearRepo.save(year));
    }

    @PutMapping("/years/{id}")
    public ResponseEntity<FestivalYear> updateYear(@PathVariable Long id, @RequestBody FestivalYear updated) {
        FestivalYear fy = yearRepo.findById(id).orElseThrow(() -> new RuntimeException("Year not found"));
        fy.setStartDate(updated.getStartDate());
        fy.setEndDate(updated.getEndDate());
        fy.setActive(updated.getActive());
        return ResponseEntity.ok(yearRepo.save(fy));
    }

    @PostMapping("/days")
    public ResponseEntity<FestivalDay> createDay(@Valid @RequestBody FestivalDay day) {
        return ResponseEntity.ok(dayRepo.save(day));
    }

    @PutMapping("/days/{id}")
    public ResponseEntity<FestivalDay> updateDay(@PathVariable Long id, @RequestBody FestivalDay updated) {
        FestivalDay day = dayRepo.findById(id).orElseThrow(() -> new RuntimeException("Day not found"));
        day.setDate(updated.getDate());
        day.setDayNumber(updated.getDayNumber());
        day.setLabel(updated.getLabel());
        return ResponseEntity.ok(dayRepo.save(day));
    }

    @DeleteMapping("/days/{id}")
    public ResponseEntity<Void> deleteDay(@PathVariable Long id) {
        dayRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/years/{yearId}/days")
    public List<FestivalDay> daysForYear(@PathVariable Long yearId) {
        return dayRepo.findByFestivalYearIdOrderByDayNumberAsc(yearId);
    }
}
