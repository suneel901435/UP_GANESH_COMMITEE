package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.*;
import com.ganeshfest.collection.entity.*;
import com.ganeshfest.collection.enums.LoanStatus;
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
    private final LoanRepository loanRepo;
    private final LoanRepaymentRepository repaymentRepo;

    public PublicController(FestivalYearRepository yearRepo, FestivalDayRepository dayRepo,
                             DonationCollectionRepository collectionRepo, ExpenseRepository expenseRepo,
                             ProgramRepository programRepo, AnnadanamSponsorRepository annadanamRepo,
                             SponsorRepository sponsorRepo, VelamItemRepository velamRepo,
                             LoanRepository loanRepo, LoanRepaymentRepository repaymentRepo) {
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
        this.collectionRepo = collectionRepo;
        this.expenseRepo = expenseRepo;
        this.programRepo = programRepo;
        this.annadanamRepo = annadanamRepo;
        this.sponsorRepo = sponsorRepo;
        this.velamRepo = velamRepo;
        this.loanRepo = loanRepo;
        this.repaymentRepo = repaymentRepo;
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
    // Includes the running village-lending (vaddi) fund totals, which are
    // fund-wide (not scoped to one year) since it's one continuous fund built
    // up across years - see Loan entity javadoc.
    @GetMapping("/years/{year}/dashboard")
    public DashboardDto dashboard(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);

        BigDecimal totalCollection = collectionRepo.sumByYearId(fy.getId());
        BigDecimal totalExpense = expenseRepo.sumByYearId(fy.getId());
        BigDecimal yearSurplus = totalCollection.subtract(totalExpense);
        BigDecimal openingBalance = fy.getOpeningBalance() != null ? fy.getOpeningBalance() : BigDecimal.ZERO;
        BigDecimal fundAvailable = openingBalance.add(yearSurplus);

        BigDecimal totalPrincipalLent = loanRepo.sumAllPrincipalLent();
        BigDecimal totalPrincipalRecovered = repaymentRepo.sumAllPrincipalPaid();
        BigDecimal totalInterestEarned = repaymentRepo.sumAllInterestPaid();
        BigDecimal outstandingPrincipal = totalPrincipalLent.subtract(totalPrincipalRecovered);

        BigDecimal cashInHand = fundAvailable.subtract(outstandingPrincipal).add(totalInterestEarned);

        List<FestivalDay> days = dayRepo.findByFestivalYearIdOrderByDayNumberAsc(fy.getId());
        int totalDonors = collectionRepo.findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(fy.getId()).size();

        return DashboardDto.builder()
                .year(year)
                .totalCollection(totalCollection)
                .totalExpense(totalExpense)
                .yearSurplus(yearSurplus)
                .openingBalance(openingBalance)
                .fundAvailable(fundAvailable)
                .totalPrincipalLent(totalPrincipalLent)
                .totalPrincipalRecovered(totalPrincipalRecovered)
                .totalInterestEarned(totalInterestEarned)
                .outstandingPrincipal(outstandingPrincipal)
                .cashInHand(cashInHand)
                .totalDonors(totalDonors)
                .daysCount(days.size())
                .build();
    }

    // ---- Day-wise summary (ledger) - only days that exist as FestivalDay rows.
    // Kept for backward compatibility; the public ledger page now uses
    // /daily-ledger below instead, which covers chanda/pre-festival dates too. ----
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

    // ---- Daily ledger - EVERY date that had any collection or expense, not
    // just the 3-5 registered festival days. This is what makes chanda
    // (pre-festival house-to-house collection, often 10-15 days before the
    // festival) actually visible day-by-day, the same way festival-day
    // collections already are. ----
    @GetMapping("/years/{year}/daily-ledger")
    public List<DailyLedgerEntryDto> dailyLedger(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);

        java.util.Set<java.time.LocalDate> dates = new java.util.TreeSet<>();
        dates.addAll(collectionRepo.distinctDatesForYear(fy.getId()));
        dates.addAll(expenseRepo.distinctDatesForYear(fy.getId()));

        return dates.stream().map(date -> {
            BigDecimal coll = collectionRepo.sumByYearIdAndDate(fy.getId(), date);
            BigDecimal exp = expenseRepo.sumByYearIdAndDate(fy.getId(), date);
            FestivalDay matchingDay = dayRepo.findByFestivalYearIdAndDate(fy.getId(), date).orElse(null);

            return DailyLedgerEntryDto.builder()
                    .date(date)
                    .festivalDayLabel(matchingDay != null ? ("Day " + matchingDay.getDayNumber()) : null)
                    .totalCollection(coll)
                    .totalExpense(exp)
                    .balance(coll.subtract(exp))
                    .build();
        }).collect(Collectors.toList());
    }

    // ---- Single date itemized - replaces the old FestivalDay-row-only detail
    // view. Works for any date, whether or not it's one of the registered
    // festival days. ----
    @GetMapping("/years/{year}/day-detail/{date}")
    public DateDetailDto dateDetail(@PathVariable Integer year, @PathVariable String date) {
        FestivalYear fy = getYearOrThrow(year);
        java.time.LocalDate parsedDate = java.time.LocalDate.parse(date);
        FestivalDay matchingDay = dayRepo.findByFestivalYearIdAndDate(fy.getId(), parsedDate).orElse(null);

        List<CollectionEntryDto> collections = collectionRepo
                .findByFestivalYearIdAndTransactionDateOrderByCreatedAtDesc(fy.getId(), parsedDate).stream()
                .map(c -> toCollectionDto(c, matchingDay))
                .collect(Collectors.toList());

        List<ExpenseEntryDto> expenses = expenseRepo
                .findByFestivalYearIdAndTransactionDateOrderByCreatedAtDesc(fy.getId(), parsedDate).stream()
                .map(e -> toExpenseDto(e, matchingDay))
                .collect(Collectors.toList());

        BigDecimal coll = collectionRepo.sumByYearIdAndDate(fy.getId(), parsedDate);
        BigDecimal exp = expenseRepo.sumByYearIdAndDate(fy.getId(), parsedDate);

        return DateDetailDto.builder()
                .date(parsedDate)
                .festivalDayLabel(matchingDay != null ? ("Day " + matchingDay.getDayNumber()) : null)
                .totalCollection(coll)
                .totalExpense(exp)
                .balance(coll.subtract(exp))
                .collections(collections)
                .expenses(expenses)
                .build();
    }

    // ---- Single day itemized (old FestivalDay-row version) - kept for
    // backward compatibility, superseded by /day-detail/{date} above. ----
    @GetMapping("/days/{dayId}")
    public DayDetailDto dayDetail(@PathVariable Long dayId) {
        FestivalDay day = dayRepo.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Day not found"));

        List<CollectionEntryDto> collections = collectionRepo
                .findByFestivalDayIdOrderByTransactionDateDescCreatedAtDesc(dayId).stream()
                .map(c -> toCollectionDto(c, day))
                .collect(Collectors.toList());

        List<ExpenseEntryDto> expenses = expenseRepo
                .findByFestivalDayIdOrderByTransactionDateDescCreatedAtDesc(dayId).stream()
                .map(e -> toExpenseDto(e, day))
                .collect(Collectors.toList());

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

    // ---- Every collection for the year (pre-festival + festival-day entries) ----
    @GetMapping("/years/{year}/collections")
    public List<CollectionEntryDto> allCollectionsForYear(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return collectionRepo.findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(fy.getId()).stream()
                .map(c -> toCollectionDto(c, c.getFestivalDay()))
                .collect(Collectors.toList());
    }

    // ---- Every expense for the year (pre-festival + festival-day entries) ----
    @GetMapping("/years/{year}/expenses")
    public List<ExpenseEntryDto> allExpensesForYear(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return expenseRepo.findByFestivalYearIdOrderByTransactionDateDescCreatedAtDesc(fy.getId()).stream()
                .map(e -> toExpenseDto(e, e.getFestivalDay()))
                .collect(Collectors.toList());
    }

    private CollectionEntryDto toCollectionDto(DonationCollection c, FestivalDay day) {
        return CollectionEntryDto.builder()
                .id(c.getId())
                .donorName(c.getDonorName())
                .donorContact(c.getDonorContact())
                .amount(c.getAmount())
                .paymentMode(c.getPaymentMode().name())
                .notes(c.getNotes())
                .transactionDate(c.getTransactionDate())
                .festivalDayLabel(day != null ? ("Day " + day.getDayNumber()) : null)
                .build();
    }

    private ExpenseEntryDto toExpenseDto(Expense e, FestivalDay day) {
        return ExpenseEntryDto.builder()
                .id(e.getId())
                .category(e.getCategory())
                .description(e.getDescription())
                .amount(e.getAmount())
                .paidTo(e.getPaidTo())
                .transactionDate(e.getTransactionDate())
                .festivalDayLabel(day != null ? ("Day " + day.getDayNumber()) : null)
                .build();
    }

    // ---- Programs ----
    @GetMapping("/years/{year}/programs")
    public List<Program> programs(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return programRepo.findWithFestivalDayByFestivalYearId(fy.getId());
    }

    // ---- Annadanam sponsors ----
    @GetMapping("/years/{year}/annadanam-sponsors")
    public List<AnnadanamSponsor> annadanamSponsors(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        return annadanamRepo.findWithFestivalDayByFestivalYearId(fy.getId());
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

    // ---- Festival Days overview - click-through from the "Festival Days" stat
    // card. For each registered day of the festival (however many there are -
    // 3, 5, 11, whatever the committee decided), shows the programs happening
    // that day and who's sponsoring annadanam that day, in one place. ----
    @GetMapping("/years/{year}/festival-days-overview")
    public List<FestivalDayOverviewDto> festivalDaysOverview(@PathVariable Integer year) {
        FestivalYear fy = getYearOrThrow(year);
        List<FestivalDay> days = dayRepo.findByFestivalYearIdOrderByDayNumberAsc(fy.getId());

        return days.stream().map(day -> {
            List<ProgramSummaryDto> programs = programRepo.findByFestivalDayIdOrderByIdAsc(day.getId()).stream()
                    .map(p -> ProgramSummaryDto.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .description(p.getDescription())
                            .timeSlot(p.getTimeSlot())
                            .build())
                    .collect(Collectors.toList());

            List<AnnadanamSummaryDto> sponsors = annadanamRepo.findByFestivalDayIdOrderByIdAsc(day.getId()).stream()
                    .map(a -> AnnadanamSummaryDto.builder()
                            .id(a.getId())
                            .sponsorName(a.getSponsorName())
                            .contact(a.getContact())
                            .mealCount(a.getMealCount())
                            .amount(a.getAmount())
                            .notes(a.getNotes())
                            .build())
                    .collect(Collectors.toList());

            return FestivalDayOverviewDto.builder()
                    .dayId(day.getId())
                    .date(day.getDate())
                    .dayNumber(day.getDayNumber())
                    .label(day.getLabel())
                    .programs(programs)
                    .annadanamSponsors(sponsors)
                    .build();
        }).collect(Collectors.toList());
    }
}
