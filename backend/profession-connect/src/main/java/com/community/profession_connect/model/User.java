package com.community.profession_connect.model;

import jakarta.persistence.*;
import lombok.*;

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

    public void setName(String name) { this.name = name; }
    public void setLocation(String location) { this.location = location; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

}
