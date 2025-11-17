package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummary {
    private UserInfo user;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String profession;
        private String profileImageUrl;
    }
}
