package com.community.profession_connect.dto;

import lombok.Data;

@Data
public class AiPostRequestDTO {

    private String profession; // STUDENT / TEACHER / DOCTOR
    private String category;   // MOTIVATION / FACT / TIP
}
