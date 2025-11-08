package com.community.profession_connect.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "academic_info")
@Data
public class AcademicInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String university;
    private String major;
    private String year;
    private String gpa;
}
