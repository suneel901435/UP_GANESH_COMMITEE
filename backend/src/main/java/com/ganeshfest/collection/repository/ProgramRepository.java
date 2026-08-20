package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    // Plain version kept for anywhere that doesn't need festivalDay populated
    List<Program> findByFestivalYearIdOrderByIdAsc(Long festivalYearId);

    // LEFT JOIN FETCH eagerly loads festivalDay in the SAME query, so it's
    // already initialized by the time Jackson serializes it. Without this,
    // the Hibernate6Module registered in JacksonConfig (added to stop lazy-proxy
    // serialization crashes) silently outputs null for any lazy association
    // that wasn't already loaded - which is exactly what was hiding the
    // festival day / date on every program. LEFT JOIN because festivalDay is
    // nullable (some programs span the whole festival, not one specific day).
    @Query("SELECT p FROM Program p LEFT JOIN FETCH p.festivalDay WHERE p.festivalYear.id = :festivalYearId ORDER BY p.id ASC")
    List<Program> findWithFestivalDayByFestivalYearId(@Param("festivalYearId") Long festivalYearId);

    // Used by the Festival Days overview to pull programs for one specific day
    List<Program> findByFestivalDayIdOrderByIdAsc(Long festivalDayId);
}
