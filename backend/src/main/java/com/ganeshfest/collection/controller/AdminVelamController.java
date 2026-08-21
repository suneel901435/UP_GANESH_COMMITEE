package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.MarkSoldRequest;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.VelamItem;
import com.ganeshfest.collection.enums.VelamStatus;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.VelamItemRepository;
import com.ganeshfest.collection.service.AuditLogService;
import com.ganeshfest.collection.util.AuditChangeBuilder;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/velam-items")
public class AdminVelamController {

    private final VelamItemRepository velamRepo;
    private final FestivalYearRepository yearRepo;
    private final AuditLogService auditLogService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public AdminVelamController(VelamItemRepository velamRepo, FestivalYearRepository yearRepo, AuditLogService auditLogService) {
        this.velamRepo = velamRepo;
        this.yearRepo = yearRepo;
        this.auditLogService = auditLogService;
    }

    public static class VelamRequest {
        public Long festivalYearId;
        public String itemName;
        public String description;
        public java.math.BigDecimal basePrice;
        public String imageUrl;
    }

    @PostMapping
    public ResponseEntity<VelamItem> create(@RequestBody VelamRequest req, Authentication auth) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        VelamItem item = VelamItem.builder()
                .festivalYear(fy)
                .itemName(req.itemName)
                .description(req.description)
                .basePrice(req.basePrice)
                .status(VelamStatus.AVAILABLE)
                .imageUrl(req.imageUrl)
                .build();
        VelamItem saved = velamRepo.save(item);
        auditLogService.logCreate("Velam Paata", saved.getId(), saved.getItemName(), saved.getBasePrice(), fy.getYear(), auth);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VelamItem> update(@PathVariable Long id, @RequestBody VelamRequest req, Authentication auth) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        AuditChangeBuilder diff = new AuditChangeBuilder()
                .track("Item", item.getItemName(), req.itemName)
                .track("Base Price", item.getBasePrice(), req.basePrice)
                .track("Description", item.getDescription(), req.description);

        item.setItemName(req.itemName);
        item.setDescription(req.description);
        item.setBasePrice(req.basePrice);
        if (req.imageUrl != null) item.setImageUrl(req.imageUrl);
        VelamItem saved = velamRepo.save(item);
        auditLogService.logUpdate("Velam Paata", saved.getId(), saved.getItemName(), saved.getBasePrice(),
                saved.getFestivalYear().getYear(), diff.build(), auth);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/mark-sold")
    public ResponseEntity<VelamItem> markSold(@PathVariable Long id, @Valid @RequestBody MarkSoldRequest req, Authentication auth) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        item.setBuyerName(req.getBuyerName());
        item.setBuyerContact(req.getBuyerContact());
        item.setFinalPrice(req.getFinalPrice());
        item.setStatus(VelamStatus.SOLD);
        VelamItem saved = velamRepo.save(item);
        auditLogService.logUpdate("Velam Paata", saved.getId(), saved.getItemName() + " (sold to " + saved.getBuyerName() + ")",
                saved.getFinalPrice(), saved.getFestivalYear().getYear(), "Status: AVAILABLE → SOLD", auth);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/unsell")
    public ResponseEntity<VelamItem> unsell(@PathVariable Long id, Authentication auth) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        item.setBuyerName(null);
        item.setBuyerContact(null);
        item.setFinalPrice(null);
        item.setStatus(VelamStatus.AVAILABLE);
        VelamItem saved = velamRepo.save(item);
        auditLogService.logUpdate("Velam Paata", saved.getId(), saved.getItemName(), null,
                saved.getFestivalYear().getYear(), "Status: SOLD → AVAILABLE", auth);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        auditLogService.logDelete("Velam Paata", item.getId(), item.getItemName(), item.getBasePrice(),
                item.getFestivalYear().getYear(), auth);
        velamRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Simple local-disk image upload for item photos. Returns a URL you then
     * pass as imageUrl when creating/updating the item. Fine for a free-tier
     * deploy with low traffic; swap for Cloudinary later if the committee
     * wants images to survive container restarts on Render's free tier.
     *
     * Files are written under uploadDir/velam-items/ so the on-disk path
     * matches the "/uploads/velam-items/..." URL that WebConfig serves
     * (WebConfig maps /uploads/** onto the shared base uploadDir).
     */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        Path dir = Paths.get(uploadDir, "velam-items");
        Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID() + ext;
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        return ResponseEntity.ok().body("/uploads/velam-items/" + filename);
    }
}
