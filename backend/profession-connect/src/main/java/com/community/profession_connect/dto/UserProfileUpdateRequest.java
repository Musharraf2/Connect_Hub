package com.community.profession_connect.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List; // <-- ADD THIS IMPORT

@Setter
@Getter
public class UserProfileUpdateRequest {
    // These fields are already here
    private String name;
    private String location;
    private String aboutMe;
    private String phone;

    // --- ADD ALL THESE NEW FIELDS ---
    private String university;
    private String major;
    private String year;
    private String gpa;
    private List<String> skills;
    private List<String> interests;
}