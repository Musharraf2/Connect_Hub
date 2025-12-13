package com.community.profession_connect.repository;

import com.community.profession_connect.model.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    
    long countByPostId(Long postId);
}
