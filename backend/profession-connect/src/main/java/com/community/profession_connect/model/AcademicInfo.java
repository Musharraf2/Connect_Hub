package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "academic_info")
@Data
public class AcademicInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true) // Each user should only have one academic info row
    private Long userId;

    private String university;
    private String major;
    private String year;
    private String gpa;
}