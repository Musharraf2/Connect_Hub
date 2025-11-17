package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private UserInfo sender;
    private UserInfo receiver;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isRead;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String profession;
        private String profileImageUrl;
    }
}
