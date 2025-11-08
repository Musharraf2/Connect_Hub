package com.community.profession_connect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private UserInfo user;
    private String profession;
    private LocalDateTime createdAt;
    private Integer likesCount;
    private Integer commentsCount;
    private boolean likedByCurrentUser;
    private List<CommentResponse> comments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String profession;
    }
}
