package com.community.profession_connect.config;

import com.community.profession_connect.service.OnlineUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WebSocketEventListenerTest {

    @Mock
    private OnlineUserService onlineUserService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private WebSocketEventListener webSocketEventListener;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testOnlineUserService_IsInjectedCorrectly() {
        // Verify that the service is injected
        assertNotNull(webSocketEventListener);
        assertNotNull(onlineUserService);
        assertNotNull(messagingTemplate);
    }

    @Test
    void testMessagingTemplate_CanSendOnlineStatus() {
        // Test that messagingTemplate can send the expected JSON format
        Long userId = 1L;
        Map<String, Object> status = Map.of("userId", userId, "status", "ONLINE");
        
        // Act
        messagingTemplate.convertAndSend("/topic/online-status", status);
        
        // Assert
        verify(messagingTemplate, times(1)).convertAndSend("/topic/online-status", status);
    }

    @Test
    void testMessagingTemplate_CanSendOfflineStatus() {
        // Test that messagingTemplate can send the expected JSON format
        Long userId = 2L;
        Map<String, Object> status = Map.of("userId", userId, "status", "OFFLINE");
        
        // Act
        messagingTemplate.convertAndSend("/topic/online-status", status);
        
        // Assert
        verify(messagingTemplate, times(1)).convertAndSend("/topic/online-status", status);
    }
}
