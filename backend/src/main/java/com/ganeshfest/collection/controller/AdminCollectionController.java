package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.DonationCollection;
import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.repository.DonationCollectionRepository;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/collections")
public class AdminCollectionController {

    private final DonationCollectionRepository collectionRepo;
    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;

    public AdminCollectionController(DonationCollectionRepository collectionRepo, FestivalYearRepository yearRepo, FestivalDayRepository dayRepo) {
        this.collectionRepo = collectionRepo;
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
    }

    public static class CollectionRequest {
        public Long festivalYearId;      // required
        public String transactionDate;   // required, ISO format e.g. 2026-08-20 - defaults to today on the frontend
        public String donorName;
        public String donorContact;
        public java.math.BigDecimal amount;
        public String paymentMode;
        public String notes;
        // No festivalDayId here on purpose - the backend auto-detects it below,
        // matching transactionDate against the year's festival days. The admin
        // never has to think about "is this a festival day or not" - they just
        // pick the date and everything else follows from that.
    }

    /**
     * Auto-links a collection/expense to a FestivalDay purely by date match -
     * if transactionDate happens to fall on one of the festival's actual days,
     * it's linked automatically (shows up in the day-wise ledger); otherwise
     * it stays a "general fund" entry (pre-festival collection, post-festival
     * settlement, etc). Either way it counts toward the year's totals.
     */
    private FestivalDay autoDetectFestivalDay(Long festivalYearId, LocalDate date) {
        return dayRepo.findByFestivalYearIdAndDate(festivalYearId, date).orElse(null);
    }

    @PostMapping
    public ResponseEntity<DonationCollection> create(@RequestBody CollectionRequest req, Authentication auth) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId)
                .orElseThrow(() -> new RuntimeException("Festival year not found"));
        LocalDate date = LocalDate.parse(req.transactionDate);
        FestivalDay day = autoDetectFestivalDay(fy.getId(), date);

        DonationCollection c = DonationCollection.builder()
                .festivalYear(fy)
                .festivalDay(day)
                .transactionDate(date)
                .donorName(req.donorName)
                .donorContact(req.donorContact)
                .amount(req.amount)
                .paymentMode(com.ganeshfest.collection.enums.PaymentMode.valueOf(req.paymentMode))
                .notes(req.notes)
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();

        return ResponseEntity.ok(collectionRepo.save(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationCollection> update(@PathVariable Long id, @RequestBody CollectionRequest req) {
        DonationCollection c = collectionRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        c.setDonorName(req.donorName);
        c.setDonorContact(req.donorContact);
        c.setAmount(req.amount);
        c.setPaymentMode(com.ganeshfest.collection.enums.PaymentMode.valueOf(req.paymentMode));
        c.setNotes(req.notes);
        if (req.transactionDate != null) {
            LocalDate date = LocalDate.parse(req.transactionDate);
            c.setTransactionDate(date);
            Long yearId = req.festivalYearId != null ? req.festivalYearId : c.getFestivalYear().getId();
            c.setFestivalDay(autoDetectFestivalDay(yearId, date));
        }
        return ResponseEntity.ok(collectionRepo.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        collectionRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
