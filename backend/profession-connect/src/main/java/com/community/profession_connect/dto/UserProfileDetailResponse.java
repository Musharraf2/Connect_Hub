package com.community.profession_connect.dto;

import com.community.profession_connect.model.AcademicInfo;
import com.community.profession_connect.model.Interest;
import com.community.profession_connect.model.Skill;
import com.community.profession_connect.model.User;
import lombok.Data;

import java.util.List;

@Data
public class UserProfileDetailResponse {

    // From User
    private Long id;
    private String name;
    private String email;
    private String profession;
    private String location;
    private String aboutMe;

    // Related Data
    private AcademicInfo academicInfo;
    private List<Skill> skills;
    private List<Interest> interests;

    // --- ADD THESE NEW FIELDS ---
    private int connectionsCount;
    private int pendingRequestsCount;

    // Helper method to build this DTO
    public static UserProfileDetailResponse from(User user, AcademicInfo academicInfo, List<Skill> skills, List<Interest> interests, int connectionsCount, int pendingRequestsCount) { // <-- 1. ADD ARGS
        UserProfileDetailResponse dto = new UserProfileDetailResponse();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setProfession(user.getProfession());
        dto.setLocation(user.getLocation());
        dto.setAboutMe(user.getAboutMe());

        dto.setAcademicInfo(academicInfo);
        dto.setSkills(skills);
        dto.setInterests(interests);

        // --- 2. SET NEW FIELDS ---
        dto.setConnectionsCount(connectionsCount);
        dto.setPendingRequestsCount(pendingRequestsCount);

        return dto;
    }
}