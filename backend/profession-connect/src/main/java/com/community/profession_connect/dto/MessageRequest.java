package com.community.profession_connect.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private Long senderId;
    private Long receiverId;
    private String content;
}
