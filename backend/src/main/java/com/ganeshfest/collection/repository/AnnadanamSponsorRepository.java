package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.AnnadanamSponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AnnadanamSponsorRepository extends JpaRepository<AnnadanamSponsor, Long> {

    List<AnnadanamSponsor> findByFestivalYearIdOrderByFestivalDayIdAsc(Long festivalYearId);

    // See ProgramRepository for why LEFT JOIN FETCH is required here - without
    // it, festivalDay silently serializes as null even though it's set.
    @Query("SELECT a FROM AnnadanamSponsor a LEFT JOIN FETCH a.festivalDay WHERE a.festivalYear.id = :festivalYearId ORDER BY a.festivalDay.id ASC")
    List<AnnadanamSponsor> findWithFestivalDayByFestivalYearId(@Param("festivalYearId") Long festivalYearId);

    // Used by the Festival Days overview to pull sponsors for one specific day
    List<AnnadanamSponsor> findByFestivalDayIdOrderByIdAsc(Long festivalDayId);

    long countByFestivalYearId(Long festivalYearId);
}
