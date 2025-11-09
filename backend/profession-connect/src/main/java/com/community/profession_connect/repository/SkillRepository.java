package com.community.profession_connect.repository;

import com.community.profession_connect.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORT THIS
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    @Transactional // <-- ADD THIS
    void deleteByUserId(Long userId);
    List<Skill> findAllByUserId(Long userId);
}