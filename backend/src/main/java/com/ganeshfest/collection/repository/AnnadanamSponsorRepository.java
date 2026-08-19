package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.AnnadanamSponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnadanamSponsorRepository extends JpaRepository<AnnadanamSponsor, Long> {
    List<AnnadanamSponsor> findByFestivalYearIdOrderByFestivalDayIdAsc(Long festivalYearId);
}
