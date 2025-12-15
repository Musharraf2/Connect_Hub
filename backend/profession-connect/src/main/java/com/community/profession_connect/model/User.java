package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String profession;

    private String aboutMe; // <-- This is the key field you need!
    private String location; // <-- You likely need this for the location shown in the image.
    
    private String profileImageUrl; // URL/path to the profile image
    private String coverImageUrl; // URL/path to the cover/background image
    private String phoneNumber; // Phone number
    private Boolean phoneVerified = false; // Phone number verification status (renamed from phoneVerified)
    private Boolean isPhonePublic = false; // Privacy control for phone number visibility
    private Boolean isEmailVerified = false; // Email verification status
    
    @Column(name = "created_at")
    private LocalDateTime createdAt; // User creation timestamp

    @Column(columnDefinition = "TEXT")
    private String professionalDetails; // JSON field for dynamic professional info (e.g., specific fields for Doctors vs. Students)

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (phoneVerified == null) phoneVerified = false;
        if (isPhonePublic == null) isPhonePublic = false;
        if (isEmailVerified == null) isEmailVerified = false;
    }

    public void setName(String name) { this.name = name; }
    public void setLocation(String location) { this.location = location; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setProfessionalDetails(String professionalDetails) { this.professionalDetails = professionalDetails; }

}
