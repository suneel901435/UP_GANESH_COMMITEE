package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findByFestivalYearIdOrderByIdAsc(Long festivalYearId);
}
