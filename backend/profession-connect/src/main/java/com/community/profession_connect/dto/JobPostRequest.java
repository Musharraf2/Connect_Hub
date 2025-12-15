package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostRequest {
    private String title;
    private String companyName;
    private String location;
    private String type;
    private String description;
    private String applyLink;
    private Long postedBy;
    private String profession;
}
