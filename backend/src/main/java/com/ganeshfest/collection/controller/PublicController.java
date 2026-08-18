package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.*;
import com.ganeshfest.collection.entity.*;
import com.ganeshfest.collection.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;
    private final DonationCollectionRepository collectionRepo;
    private final ExpenseRepository expenseRepo;
    private final ProgramRepository programRepo;
    private final AnnadanamSponsorRepository annadanamRepo;
    private final SponsorRepository sponsorRepo;
    private final VelamItemRepository velamRepo;

    public PublicController(FestivalYearRepository yearRepo, FestivalDayRepository dayRepo,
                             DonationCollectionRepository collectionRepo, ExpenseRepository expenseRepo,
                             ProgramRepository programRepo, AnnadanamSponsorRepository annadanamRepo,
                             SponsorRepository sponsorRepo, VelamItemRepository velamRepo) {
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
        this.collectionRepo = collectionRepo;
        this.expenseRepo = expenseRepo;
        this.programRepo = programRepo;
        this.annadanamRepo = annadanamRepo;
        this.sponsorRepo = sponsorRepo;
        this.velamRepo = velamRepo;
    }

    // ---- Years ----
    @GetMapping("/years")
    public List<FestivalYear> allYears() {
        return yearRepo.findAll().stream()
                .sorted(Comparator.comparing(FestivalYear::getYear).reversed())
                .collect(Collectors.toList());
    }

    private FestivalYear getYearOrThrow(Integer year) {
        return yearRepo.findByYear(year)
                .orElseThrow(() -> new RuntimeException("No festival data found for year " + year));
    }

    // ---- Dashboard ----
    @GetMapping("/years/{year}/dashboard")
    public DashboardDto dashboard(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);

        BigDecimal totalCollection = collectionRepo.sumByYearId(fy.getId());
        BigDecimal totalExpense = expenseRepo.sumByYearId(fy.getId());
        List<FestivalDay> days = dayRepo.findByFestivalYearIdOrderByDayNumberAsc(fy.getId());

        int totalDonors = days.stream()
                .mapToInt(d -> collectionRepo.findByFestivalDayIdOrderByCreatedAtDesc(d.getId()).size())
                .sum();

        return DashboardDto.builder()
                .year(year)
                .totalCollection(totalCollection)
                .totalExpense(totalExpense)
                .balance(totalCollection.subtract(totalExpense))
                .totalDonors(totalDonors)
                .daysCount(days.size())
                .build();
    }

    // ---- Day-wise summary (ledger) ----
    @GetMapping("/years/{year}/days")
    public List<DayFinanceDto> daySummaries(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        List<FestivalDay> days = dayRepo.findByFestivalYearIdOrderByDayNumberAsc(fy.getId());

        return days.stream().map(d -> {
            BigDecimal coll = collectionRepo.sumByDayId(d.getId());
            BigDecimal exp = expenseRepo.sumByDayId(d.getId());
            return DayFinanceDto.builder()
                    .dayId(d.getId())
                    .date(d.getDate())
                    .dayNumber(d.getDayNumber())
                    .label(d.getLabel())
                    .totalCollection(coll)
                    .totalExpense(exp)
                    .balance(coll.subtract(exp))
                    .build();
        }).collect(Collectors.toList());
    }

    // ---- Single day itemized ----
    @GetMapping("/days/{dayId}")
    public DayDetailDto dayDetail(@PathVariable Long dayId) {
        FestivalDay day = dayRepo.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Day not found"));

        List<DonationCollection> collections = collectionRepo.findByFestivalDayIdOrderByCreatedAtDesc(dayId);
        List<Expense> expenses = expenseRepo.findByFestivalDayIdOrderByCreatedAtDesc(dayId);
        BigDecimal coll = collectionRepo.sumByDayId(dayId);
        BigDecimal exp = expenseRepo.sumByDayId(dayId);

        return DayDetailDto.builder()
                .dayId(day.getId())
                .date(day.getDate())
                .dayNumber(day.getDayNumber())
                .label(day.getLabel())
                .totalCollection(coll)
                .totalExpense(exp)
                .balance(coll.subtract(exp))
                .collections(collections)
                .expenses(expenses)
                .build();
    }

    // ---- Programs ----
    @GetMapping("/years/{year}/programs")
    public List<Program> programs(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return programRepo.findByFestivalYearIdOrderByIdAsc(fy.getId());
    }

    // ---- Annadanam sponsors ----
    @GetMapping("/years/{year}/annadanam-sponsors")
    public List<AnnadanamSponsor> annadanamSponsors(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return annadanamRepo.findByFestivalYearIdOrderByFestivalDayIdAsc(fy.getId());
    }

    // ---- General sponsors ----
    @GetMapping("/years/{year}/sponsors")
    public List<Sponsor> sponsors(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return sponsorRepo.findByFestivalYearIdOrderByIdAsc(fy.getId());
    }

    // ---- Velam paata items ----
    @GetMapping("/years/{year}/velam-items")
    public List<VelamItem> velamItems(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return velamRepo.findByFestivalYearIdOrderByIdAsc(fy.getId());
    }

    // ---- Days list for a year (used by admin dropdowns too, harmless to expose) ----
    @GetMapping("/years/{year}/day-list")
    public List<FestivalDay> dayList(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return dayRepo.findByFestivalYearIdOrderByDayNumberAsc(fy.getId());
    }
}
