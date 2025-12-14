package com.community.profession_connect.controller;

import com.community.profession_connect.dto.MessageRequest;
import com.community.profession_connect.service.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MessageControllerTest {

    @Mock
    private MessageService messageService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MessageController messageController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testMarkMessagesAsRead_SendsWebSocketNotificationToSender() {
        // Arrange
        Long receiverId = 1L;
        Long senderId = 2L;
        
        doNothing().when(messageService).markMessagesAsRead(receiverId, senderId);

        // Act
        ResponseEntity<Void> response = messageController.markMessagesAsRead(receiverId, senderId);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(messageService, times(1)).markMessagesAsRead(receiverId, senderId);
        
        // Verify WebSocket notification was sent
        ArgumentCaptor<Map<String, Object>> notificationCaptor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate, times(1)).convertAndSend(
            eq("/queue/read/" + senderId),
            notificationCaptor.capture()
        );
        
        Map<String, Object> notification = notificationCaptor.getValue();
        assertNotNull(notification);
        assertEquals(receiverId, notification.get("receiverId"));
        assertNotNull(notification.get("timestamp"));
        assertTrue(notification.get("timestamp") instanceof Long);
    }

    @Test
    void testMarkMessagesAsRead_NotificationContainsCorrectReceiverId() {
        // Arrange
        Long receiverId = 5L;
        Long senderId = 10L;
        
        doNothing().when(messageService).markMessagesAsRead(receiverId, senderId);

        // Act
        messageController.markMessagesAsRead(receiverId, senderId);

        // Assert
        ArgumentCaptor<Map<String, Object>> notificationCaptor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate, times(1)).convertAndSend(
            eq("/queue/read/" + senderId),
            notificationCaptor.capture()
        );
        
        Map<String, Object> notification = notificationCaptor.getValue();
        assertEquals(receiverId, notification.get("receiverId"));
    }
}
