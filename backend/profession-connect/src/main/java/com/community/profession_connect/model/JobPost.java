package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String location; // Remote/On-site

    @Column(nullable = false)
    private String type; // Full-time/Internship

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String applyLink; // URL or email for applications

    @ManyToOne
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    private String profession; // For filtering (e.g., Student, Teacher)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
