package com.community.profession_connect.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserProfileUpdateRequest {
    private String name;
    private String location;
    private String aboutMe;
    private String phone;



}