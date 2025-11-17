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
    private Long senderId;
    private String senderName;
    private String senderProfileImageUrl;
    private Long receiverId;
    private String receiverName;
    private String receiverProfileImageUrl;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
}
