package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.GalleryPhoto;
import com.ganeshfest.collection.enums.GalleryCategory;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.GalleryPhotoRepository;
import com.ganeshfest.collection.service.AuditLogService;
import com.ganeshfest.collection.util.AuditChangeBuilder;
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

/**
 * Admin CRUD for the yearly photo gallery (festival photos, decoration,
 * celebrations). Same shape as AdminVelamController: upload the image first
 * to get a URL, then create/update the photo record with that URL.
 */
@RestController
@RequestMapping("/api/admin/gallery-photos")
public class AdminGalleryController {

    private final GalleryPhotoRepository galleryRepo;
    private final FestivalYearRepository yearRepo;
    private final AuditLogService auditLogService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public AdminGalleryController(GalleryPhotoRepository galleryRepo, FestivalYearRepository yearRepo, AuditLogService auditLogService) {
        this.galleryRepo = galleryRepo;
        this.yearRepo = yearRepo;
        this.auditLogService = auditLogService;
    }

    public static class GalleryPhotoRequest {
        public Long festivalYearId;
        public GalleryCategory category;
        public String caption;
        public String imageUrl;
    }

    @PostMapping
    public ResponseEntity<GalleryPhoto> create(@RequestBody GalleryPhotoRequest req, Authentication auth) {
        if (req.imageUrl == null || req.imageUrl.isBlank()) {
            throw new RuntimeException("Please upload a photo first.");
        }
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        GalleryPhoto photo = GalleryPhoto.builder()
                .festivalYear(fy)
                .category(req.category != null ? req.category : GalleryCategory.FESTIVAL)
                .caption(req.caption)
                .imageUrl(req.imageUrl)
                .build();
        GalleryPhoto saved = galleryRepo.save(photo);
        auditLogService.logCreate("Gallery", saved.getId(), summary(saved), null, fy.getYear(), auth);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryPhoto> update(@PathVariable Long id, @RequestBody GalleryPhotoRequest req, Authentication auth) {
        GalleryPhoto photo = galleryRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        AuditChangeBuilder diff = new AuditChangeBuilder()
                .track("Category", photo.getCategory(), req.category)
                .track("Caption", photo.getCaption(), req.caption);

        if (req.category != null) photo.setCategory(req.category);
        photo.setCaption(req.caption);
        if (req.imageUrl != null && !req.imageUrl.isBlank()) photo.setImageUrl(req.imageUrl);

        GalleryPhoto saved = galleryRepo.save(photo);
        auditLogService.logUpdate("Gallery", saved.getId(), summary(saved), null,
                saved.getFestivalYear().getYear(), diff.build(), auth);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        GalleryPhoto photo = galleryRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        auditLogService.logDelete("Gallery", photo.getId(), summary(photo), null,
                photo.getFestivalYear().getYear(), auth);
        galleryRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String summary(GalleryPhoto photo) {
        String label = photo.getCategory() != null ? photo.getCategory().name() : "PHOTO";
        return (photo.getCaption() != null && !photo.getCaption().isBlank()) ? label + " - " + photo.getCaption() : label;
    }

    /**
     * Simple local-disk image upload for gallery photos, same pattern as
     * AdminVelamController#uploadImage. Files land under uploadDir/gallery/
     * so the on-disk path matches the "/uploads/gallery/..." URL that
     * WebConfig serves (WebConfig maps /uploads/** onto the shared base
     * uploadDir).
     */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        Path dir = Paths.get(uploadDir, "gallery");
        Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID() + ext;
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        return ResponseEntity.ok().body("/uploads/gallery/" + filename);
    }
}
