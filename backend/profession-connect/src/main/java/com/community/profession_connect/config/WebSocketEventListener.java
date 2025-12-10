package com.community.profession_connect.config;

import com.community.profession_connect.service.OnlineUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Map;

@Component
public class WebSocketEventListener {

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Try to get userId from native headers (this is where SockJS stores it)
        GenericMessage<?> generic = (GenericMessage<?>) headerAccessor.getHeader("simpConnectMessage");
        if (generic != null) {
            StompHeaderAccessor connectAccessor = StompHeaderAccessor.wrap(generic);
            Map<String, Object> sessionAttributes = connectAccessor.getSessionAttributes();
            
            if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
                Long userId = (Long) sessionAttributes.get("userId");
                
                // Check if user is not already marked as online
                if (!onlineUserService.isUserOnline(userId)) {
                    onlineUserService.userConnected(userId);
                    System.out.println("[WebSocket] User subscribed and marked online: " + userId);
                    
                    // Broadcast online status change
                    messagingTemplate.convertAndSend("/topic/online-status", 
                        String.valueOf(userId));
                }
            }
        }
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Also try direct session attributes
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        
        System.out.println("[WebSocket] Connection event - Session attributes: " + 
            (sessionAttributes != null ? sessionAttributes.keySet() : "null"));
        
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            Long userId = (Long) sessionAttributes.get("userId");
            onlineUserService.userConnected(userId);
            System.out.println("[WebSocket] User connected: " + userId);
            
            // Broadcast online status change
            messagingTemplate.convertAndSend("/topic/online-status", 
                String.valueOf(userId));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        
        System.out.println("[WebSocket] Disconnect event - Session attributes: " + 
            (sessionAttributes != null ? sessionAttributes.keySet() : "null"));
        
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            Long userId = (Long) sessionAttributes.get("userId");
            onlineUserService.userDisconnected(userId);
            System.out.println("[WebSocket] User disconnected: " + userId);
            
            // Broadcast offline status change
            messagingTemplate.convertAndSend("/topic/online-status", 
                String.valueOf(userId));
        }
    }
}
