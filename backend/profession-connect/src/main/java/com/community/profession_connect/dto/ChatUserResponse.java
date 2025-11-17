package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserResponse {
    private Long id;
    private String name;
    private String email;
    private String profession;
    private String profileImageUrl;
    private String lastMessage;
    private Long unreadCount;
    private LocalDateTime lastMessageTimestamp;
}
