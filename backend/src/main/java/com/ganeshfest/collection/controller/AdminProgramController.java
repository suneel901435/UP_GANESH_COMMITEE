package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.entity.FestivalDay;
import com.ganeshfest.collection.entity.FestivalYear;
import com.ganeshfest.collection.entity.Program;
import com.ganeshfest.collection.repository.FestivalDayRepository;
import com.ganeshfest.collection.repository.FestivalYearRepository;
import com.ganeshfest.collection.repository.ProgramRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/programs")
public class AdminProgramController {

    private final ProgramRepository programRepo;
    private final FestivalYearRepository yearRepo;
    private final FestivalDayRepository dayRepo;

    public AdminProgramController(ProgramRepository programRepo, FestivalYearRepository yearRepo, FestivalDayRepository dayRepo) {
        this.programRepo = programRepo;
        this.yearRepo = yearRepo;
        this.dayRepo = dayRepo;
    }

    public static class ProgramRequest {
        public Long festivalYearId;
        public Long festivalDayId; // optional
        public String name;
        public String description;
        public String timeSlot;
    }

    @PostMapping
    public ResponseEntity<Program> create(@RequestBody ProgramRequest req) {
        FestivalYear fy = yearRepo.findById(req.festivalYearId).orElseThrow(() -> new RuntimeException("Year not found"));
        FestivalDay day = req.festivalDayId != null ? dayRepo.findById(req.festivalDayId).orElse(null) : null;

        Program p = Program.builder()
                .festivalYear(fy)
                .festivalDay(day)
                .name(req.name)
                .description(req.description)
                .timeSlot(req.timeSlot)
                .build();

        return ResponseEntity.ok(programRepo.save(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Program> update(@PathVariable Long id, @RequestBody ProgramRequest req) {
        Program p = programRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        p.setName(req.name);
        p.setDescription(req.description);
        p.setTimeSlot(req.timeSlot);
        if (req.festivalDayId != null) {
            p.setFestivalDay(dayRepo.findById(req.festivalDayId).orElse(null));
        }
        return ResponseEntity.ok(programRepo.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        programRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
