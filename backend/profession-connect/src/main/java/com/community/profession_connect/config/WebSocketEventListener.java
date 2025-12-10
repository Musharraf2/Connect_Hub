package com.community.profession_connect.config;

import com.community.profession_connect.service.OnlineUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
public class WebSocketEventListener {

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            Long userId = (Long) sessionAttributes.get("userId");
            onlineUserService.userConnected(userId);
            
            // Broadcast online status change
            messagingTemplate.convertAndSend("/topic/online-status", "User " + userId + " is now online");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            Long userId = (Long) sessionAttributes.get("userId");
            onlineUserService.userDisconnected(userId);
            
            // Broadcast offline status change
            messagingTemplate.convertAndSend("/topic/online-status", "User " + userId + " is now offline");
        }
    }
}
