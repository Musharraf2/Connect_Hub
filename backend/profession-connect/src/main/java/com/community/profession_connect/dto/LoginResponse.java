package com.community.profession_connect.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor; // Good practice to add for DTOs

@Getter
@Setter
@NoArgsConstructor
public class LoginResponse {
    private String name;
    private String email;
    private String profession;

    // You can keep a custom constructor if you need it
    public LoginResponse(String name, String email, String profession) {
        this.name = name;
        this.email = email;
        this.profession = profession;
    }
}