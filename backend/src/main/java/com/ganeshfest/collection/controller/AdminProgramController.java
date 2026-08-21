package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.Program;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.ProgramRepository;
import com.ganeshfest.collection.service.AuditLogService;
import com.ganeshfest.collection.util.AuditChangeBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/programs")
public class AdminProgramController {

    private final ProgramRepository programRepo;
    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;
    private final AuditLogService auditLogService;

    public AdminProgramController(ProgramRepository programRepo, FestivalYearRepository yearRepo,
                                   FestivalDayRepository dayRepo, AuditLogService auditLogService) {
        this.programRepo = programRepo;
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
        this.auditLogService = auditLogService;
    }

    public static class ProgramRequest {
        public Long festivalYearId;
        public Long festivalDayId; // optional
        public String name;
        public String description;
        public String timeSlot;
    }

    @PostMapping
    public ResponseEntity<Program> create(@RequestBody ProgramRequest req, Authentication auth) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        FestivalDay day = req.festivalDayId != null ? dayRepo.findById(req.festivalDayId).orElse(null) : null;

        Program p = Program.builder()
                .festivalYear(fy)
                .festivalDay(day)
                .name(req.name)
                .description(req.description)
                .timeSlot(req.timeSlot)
                .build();

        Program saved = programRepo.save(p);
        auditLogService.logCreate("Program", saved.getId(), saved.getName(), null, fy.getYear(), auth);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Program> update(@PathVariable Long id, @RequestBody ProgramRequest req, Authentication auth) {
        Program p = programRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        AuditChangeBuilder diff = new AuditChangeBuilder()
                .track("Name", p.getName(), req.name)
                .track("Time Slot", p.getTimeSlot(), req.timeSlot)
                .track("Description", p.getDescription(), req.description);

        p.setName(req.name);
        p.setDescription(req.description);
        p.setTimeSlot(req.timeSlot);
        if (req.festivalDayId != null) {
            p.setFestivalDay(dayRepo.findById(req.festivalDayId).orElse(null));
        }
        Program saved = programRepo.save(p);
        auditLogService.logUpdate("Program", saved.getId(), saved.getName(), null,
                saved.getFestivalYear().getYear(), diff.build(), auth);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        Program p = programRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        auditLogService.logDelete("Program", p.getId(), p.getName(), null, p.getFestivalYear().getYear(), auth);
        programRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
