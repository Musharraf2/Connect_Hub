package com.community.profession_connect.repository;

import com.community.profession_connect.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByProfessionOrderByCreatedAtDesc(String profession);
}
