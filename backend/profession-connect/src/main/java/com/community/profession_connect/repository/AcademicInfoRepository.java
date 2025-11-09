package com.community.profession_connect.repository;

import com.community.profession_connect.model.AcademicInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AcademicInfoRepository extends JpaRepository<AcademicInfo, Long> {
    Optional<AcademicInfo> findByUserId(Long userId);
}