package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    private String category;

    @Column(name = "content", columnDefinition = "TEXT")
    private String noteText;   // <-- matches service code

    private boolean autoDelete;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
