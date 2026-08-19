package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Set up a festival year and its days. Do this FIRST each year before
 * entering any collections/expenses.
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
        if (updated.getOpeningBalance() != null) {
            fy.setOpeningBalance(updated.getOpeningBalance());
        }
        return ResponseEntity.ok(yearRepo.save(fy));
    }

    // Plain request shape with an explicit festivalYearId - not a nested
    // {festivalYear: {id: ...}} object. Nested-entity JSON bodies are fragile
    // (an empty string or missing id silently becomes a transient entity with
    // a null id, which then fails at the database with a confusing raw SQL
    // error instead of a clear message) - this is the same class of bug that
    // hit collections/expenses earlier, fixed here the same way.
    public static class DayRequest {
        public Long festivalYearId;
        public String date;      // ISO format, e.g. 2026-08-20
        public Integer dayNumber;
        public String label;
    }

    @PostMapping("/days")
    public ResponseEntity<FestivalDay> createDay(@RequestBody DayRequest req) {
        if (req.festivalYearId == null) {
            throw new RuntimeException("Please select a festival year before adding a day. If no years show up in the dropdown, create one first under 'Create a Festival Year' above.");
        }
        FestivalYear fy = yearRepo.findById(req.festivalYearId)
                .orElseThrow(() -> new RuntimeException("Festival year not found - it may have been deleted. Refresh the page and try again."));

        if (req.date == null || req.date.isBlank()) {
            throw new RuntimeException("Please pick a date for this day.");
        }
        if (req.dayNumber == null) {
            throw new RuntimeException("Please enter a day number.");
        }

        FestivalDay day = FestivalDay.builder()
                .festivalYear(fy)
                .date(LocalDate.parse(req.date))
                .dayNumber(req.dayNumber)
                .label(req.label)
                .build();

        return ResponseEntity.ok(dayRepo.save(day));
    }

    @PutMapping("/days/{id}")
    public ResponseEntity<FestivalDay> updateDay(@PathVariable Long id, @RequestBody DayRequest req) {
        FestivalDay day = dayRepo.findById(id).orElseThrow(() -> new RuntimeException("Day not found"));
        if (req.date != null) day.setDate(LocalDate.parse(req.date));
        if (req.dayNumber != null) day.setDayNumber(req.dayNumber);
        day.setLabel(req.label);
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
