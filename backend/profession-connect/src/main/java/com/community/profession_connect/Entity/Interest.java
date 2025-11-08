package com.community.profession_connect.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "interests")
@Data
public class Interest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String interest;
}
