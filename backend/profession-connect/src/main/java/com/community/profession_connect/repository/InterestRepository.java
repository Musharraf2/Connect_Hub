package com.community.profession_connect.repository;

import com.community.profession_connect.model.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORT THIS
import java.util.List;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    @Transactional // <-- ADD THIS
    void deleteByUserId(Long userId);
    List<Interest> findAllByUserId(Long userId);
}