package com.ganeshfest.collection.repository;

import com.ganeshfest.collection.entity.GalleryPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, Long> {
    List<GalleryPhoto> findByFestivalYearIdOrderByUploadedAtDescIdDesc(Long festivalYearId);

    long countByFestivalYearId(Long festivalYearId);
}
