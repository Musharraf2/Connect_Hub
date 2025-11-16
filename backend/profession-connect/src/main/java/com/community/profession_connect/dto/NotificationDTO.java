package com.community.profession_connect.dto;

import com.community.profession_connect.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
    private ActorDTO actor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActorDTO {
        private Long id;
        private String name;
        private String profileImageUrl;
    }
}
