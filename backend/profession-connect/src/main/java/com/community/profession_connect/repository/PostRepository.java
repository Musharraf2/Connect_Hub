package com.community.profession_connect.repository;

import com.community.profession_connect.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Only posts that are NOT soft-deleted
    List<Post> findByProfessionAndDeletedFalseOrderByCreatedAtDesc(String profession);

    // Fetch posts by user ID (for user profile)
    List<Post> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

}

