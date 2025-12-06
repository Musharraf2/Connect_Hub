package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiNoteDTO {
    private String noteText;
    private String category;
    private boolean autoDeleted;
    private String createdAt;
}
