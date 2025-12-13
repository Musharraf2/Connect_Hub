package com.community.profession_connect.repository;

import com.community.profession_connect.model.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    
    long countByPostId(Long postId);
    
    Optional<PostReport> findByPostIdAndUserId(Long postId, Long userId);
}
