package com.community.profession_connect.repository;

import com.community.profession_connect.model.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Long> {
    
    // Find all job posts by profession
    List<JobPost> findByProfessionOrderByCreatedAtDesc(String profession);
    
    // Find all job posts (latest first)
    List<JobPost> findAllByOrderByCreatedAtDesc();
    
    // Find job posts by type and profession
    List<JobPost> findByTypeAndProfessionOrderByCreatedAtDesc(String type, String profession);
    
    // Find job posts by location and profession
    List<JobPost> findByLocationAndProfessionOrderByCreatedAtDesc(String location, String profession);
    
    // Find job posts by type, location, and profession
    List<JobPost> findByTypeAndLocationAndProfessionOrderByCreatedAtDesc(String type, String location, String profession);
    
    // Find job posts by user
    List<JobPost> findByPostedByIdOrderByCreatedAtDesc(Long userId);
}
