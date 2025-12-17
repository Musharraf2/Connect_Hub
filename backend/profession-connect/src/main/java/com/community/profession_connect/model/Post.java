package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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

    private Integer likesCount = 0;

    private String imageUrl;

    // ---------------- AI SYSTEM FIELDS ----------------

    /**
     * When AI marks a post harmful (sexual, hate etc.)
     * it gets auto-deleted (soft delete)
     */
    private boolean deleted = false;  // <--- IMPORTANT!

    /**
     * AI-generated notes (similar to Twitter Grok Notes)
     */
    // ---------------- AI POST METADATA ----------------

    @Column(name = "is_ai_post", nullable = false)
    private Boolean aiPost = false;


    @Column(name = "ai_category")
    private String aiCategory; // MOTIVATION / FACT / TIP

// --------------------------------------------------

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<AiNote> aiNotes;

    // ---------------------------------------------------

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PostLike> likes;

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PostReport> reports;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (likesCount == null) likesCount = 0;
    }
}

