package com.community.profession_connect.repository;

import com.community.profession_connect.model.AiNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiNoteRepository extends JpaRepository<AiNote, Long> {
    List<AiNote> findByPostId(Long postId);
}
