package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostResponse {
    private Long id;
    private String title;
    private String companyName;
    private String location;
    private String type;
    private String description;
    private String applyLink;
    private UserProfileResponse postedBy;
    private String profession;
    private LocalDateTime createdAt;
    
    // Trust & Security fields
    private Integer trustScore;
    private Boolean isLinkSafe;
    private String status;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileResponse {
        private Long id;
        private String name;
        private String email;
        private String profession;
        private String profileImageUrl;
    }
}
