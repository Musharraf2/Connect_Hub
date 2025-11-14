package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.*; // Make sure ToString.Exclude and EqualsAndHashCode.Exclude are imported
import java.time.LocalDateTime;
import java.util.List; // ❗️ Import List

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String profession;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "likes_count")
    private Integer likesCount = 0;
    
    private String imageUrl; // URL/path to the post image

    // ⬇️ --- ADD THIS SECTION --- ⬇️

    /**
     * This defines the relationship to the PostLike entity.
     * cascade = CascadeType.REMOVE: When a Post is deleted, delete all its associated likes.
     * orphanRemoval = true: Cleans up any likes that are no longer referenced by this post.
     */
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude // Prevents infinite loops in Lombok's toString()
    @EqualsAndHashCode.Exclude // Prevents infinite loops in Lombok's equals/hashCode()
    private List<PostLike> likes;

    /**
     * This defines the relationship to the Comment entity.
     * cascade = CascadeType.REMOVE: When a Post is deleted, delete all its associated comments.
     */
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Comment> comments;

    // ⬆️ --- END OF ADDED SECTION --- ⬆️


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (likesCount == null) {
            likesCount = 0;
        }
    }
}