package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.MarkSoldRequest;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.VelamItem;
import com.ganeshfest.collection.enums.VelamStatus;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.VelamItemRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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

    @Value("${app.upload.dir}")
    private String uploadDir;

    public AdminVelamController(VelamItemRepository velamRepo, FestivalYearRepository yearRepo) {
        this.velamRepo = velamRepo;
        this.yearRepo = yearRepo;
    }

    public static class VelamRequest {
        public Long festivalYearId;
        public String itemName;
        public String description;
        public java.math.BigDecimal basePrice;
        public String imageUrl;
    }

    @PostMapping
    public ResponseEntity<VelamItem> create(@RequestBody VelamRequest req) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        VelamItem item = VelamItem.builder()
                .festivalYear(fy)
                .itemName(req.itemName)
                .description(req.description)
                .basePrice(req.basePrice)
                .status(VelamStatus.AVAILABLE)
                .imageUrl(req.imageUrl)
                .build();
        return ResponseEntity.ok(velamRepo.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VelamItem> update(@PathVariable Long id, @RequestBody VelamRequest req) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        item.setItemName(req.itemName);
        item.setDescription(req.description);
        item.setBasePrice(req.basePrice);
        if (req.imageUrl != null) item.setImageUrl(req.imageUrl);
        return ResponseEntity.ok(velamRepo.save(item));
    }

    @PostMapping("/{id}/mark-sold")
    public ResponseEntity<VelamItem> markSold(@PathVariable Long id, @Valid @RequestBody MarkSoldRequest req) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        item.setBuyerName(req.getBuyerName());
        item.setBuyerContact(req.getBuyerContact());
        item.setFinalPrice(req.getFinalPrice());
        item.setStatus(VelamStatus.SOLD);
        return ResponseEntity.ok(velamRepo.save(item));
    }

    @PostMapping("/{id}/unsell")
    public ResponseEntity<VelamItem> unsell(@PathVariable Long id) {
        VelamItem item = velamRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        item.setBuyerName(null);
        item.setBuyerContact(null);
        item.setFinalPrice(null);
        item.setStatus(VelamStatus.AVAILABLE);
        return ResponseEntity.ok(velamRepo.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        velamRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Simple local-disk image upload for item photos. Returns a URL you then
     * pass as imageUrl when creating/updating the item. Fine for a free-tier
     * deploy with low traffic; swap for Cloudinary later if the committee
     * wants images to survive container restarts on Render's free tier.
     */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        Path dir = Paths.get(uploadDir);
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
