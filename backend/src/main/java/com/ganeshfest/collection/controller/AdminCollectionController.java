package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.DonationCollection;
import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.repository.DonationCollectionRepository;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/collections")
public class AdminCollectionController {

    private final DonationCollectionRepository collectionRepo;
    private final FestivalDayRepository dayRepo;

    public AdminCollectionController(DonationCollectionRepository collectionRepo, FestivalDayRepository dayRepo) {
        this.collectionRepo = collectionRepo;
        this.dayRepo = dayRepo;
    }

    public static class CollectionRequest {
        public Long festivalDayId;
        public String donorName;
        public String donorContact;
        public java.math.BigDecimal amount;
        public String paymentMode;
        public String notes;
    }

    @PostMapping
    public ResponseEntity<DonationCollection> create(@RequestBody CollectionRequest req, Authentication auth) {
        FestivalDay day = dayRepo.findById(req.festivalDayId)
                .orElseThrow(() -> new RuntimeException("Festival day not found"));

        DonationCollection c = DonationCollection.builder()
                .festivalDay(day)
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
        return ResponseEntity.ok(collectionRepo.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        collectionRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
