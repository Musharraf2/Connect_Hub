package com.community.profession_connect.service;

import com.community.profession_connect.dto.NotificationDTO;
import com.community.profession_connect.model.*;
import com.community.profession_connect.repository.NotificationRepository;
import com.community.profession_connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Get all notifications for a user
    public List<NotificationDTO> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Mark a notification as read
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return convertToDTO(notification);
    }

    // Mark all notifications as read
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    // Delete a notification
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Get unread count
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    // Create a like notification
    @Transactional
    public void createLikeNotification(Long postOwnerId, Long likerId, Long postId) {
        // Don't notify if user likes their own post
        if (postOwnerId.equals(likerId)) {
            return;
        }

        User postOwner = userRepository.findById(postOwnerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User liker = userRepository.findById(likerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setType(NotificationType.LIKE);
        notification.setMessage("liked your post");
        notification.setUser(postOwner);
        notification.setActor(liker);
        notification.setRelatedEntityId(postId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    // Create a comment notification
    @Transactional
    public void createCommentNotification(Long postOwnerId, Long commenterId, Long postId) {
        // Don't notify if user comments on their own post
        if (postOwnerId.equals(commenterId)) {
            return;
        }

        User postOwner = userRepository.findById(postOwnerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User commenter = userRepository.findById(commenterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setType(NotificationType.COMMENT);
        notification.setMessage("commented on your post");
        notification.setUser(postOwner);
        notification.setActor(commenter);
        notification.setRelatedEntityId(postId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    // Create a connection accepted notification
    @Transactional
    public void createConnectionAcceptedNotification(Long requesterId, Long accepterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User accepter = userRepository.findById(accepterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setType(NotificationType.CONNECTION_ACCEPTED);
        notification.setMessage("accepted your connection request");
        notification.setUser(requester);
        notification.setActor(accepter);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    // Create a connection request notification
    @Transactional
    public void createConnectionRequestNotification(Long receiverId, Long requesterId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setType(NotificationType.CONNECTION_REQUEST);
        notification.setMessage("sent you a connection request");
        notification.setUser(receiver);
        notification.setActor(requester);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    // Convert entity to DTO
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedEntityId(notification.getRelatedEntityId());

        NotificationDTO.ActorDTO actorDTO = new NotificationDTO.ActorDTO();
        actorDTO.setId(notification.getActor().getId());
        actorDTO.setName(notification.getActor().getName());
        actorDTO.setProfileImageUrl(notification.getActor().getProfileImageUrl());
        dto.setActor(actorDTO);

        return dto;
    }
}