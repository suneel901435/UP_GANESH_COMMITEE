package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.*;
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
    private final SponsorRepository sponsorRepo;
    private final DonationCollectionRepository collectionRepo;
    private final ExpenseRepository expenseRepo;
    private final ProgramRepository programRepo;
    private final AnnadanamSponsorRepository annadanamRepo;
    private final VelamItemRepository velamRepo;

    public AdminSetupController(FestivalYearRepository yearRepo, FestivalDayRepository dayRepo,
                                 SponsorRepository sponsorRepo, DonationCollectionRepository collectionRepo,
                                 ExpenseRepository expenseRepo, ProgramRepository programRepo,
                                 AnnadanamSponsorRepository annadanamRepo, VelamItemRepository velamRepo) {
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
        this.sponsorRepo = sponsorRepo;
        this.collectionRepo = collectionRepo;
        this.expenseRepo = expenseRepo;
        this.programRepo = programRepo;
        this.annadanamRepo = annadanamRepo;
        this.velamRepo = velamRepo;
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

    /**
     * Deletes a festival year - only when it's genuinely empty. Sponsors,
     * collections, expenses, programs, annadanam sponsors, and velam items
     * all hold a required (non-null) FK back to festivalYear with no cascade
     * configured on that side, so deleting a year that still has any of
     * these would otherwise fail with a raw SQL foreign-key error. Refusing
     * up front with a clear message is far friendlier than that. Festival
     * days themselves DO cascade (see FestivalYear.days) and are deleted
     * automatically along with the year.
     */
    @DeleteMapping("/years/{id}")
    public ResponseEntity<?> deleteYear(@PathVariable Long id) {
        FestivalYear fy = yearRepo.findById(id).orElseThrow(() -> new RuntimeException("Year not found"));

        long sponsors = sponsorRepo.countByFestivalYearId(id);
        long collections = collectionRepo.countByFestivalYearId(id);
        long expenses = expenseRepo.countByFestivalYearId(id);
        long programs = programRepo.countByFestivalYearId(id);
        long annadanam = annadanamRepo.countByFestivalYearId(id);
        long velamItems = velamRepo.countByFestivalYearId(id);
        long total = sponsors + collections + expenses + programs + annadanam + velamItems;

        if (total > 0) {
            throw new RuntimeException(
                    "Can't delete " + fy.getYear() + " - it still has " + total + " record(s) "
                    + "(sponsors: " + sponsors + ", collections: " + collections + ", expenses: " + expenses
                    + ", programs: " + programs + ", annadanam sponsors: " + annadanam + ", velam items: " + velamItems
                    + "). Delete or move those first.");
        }

        yearRepo.deleteById(id);
        return ResponseEntity.noContent().build();
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
