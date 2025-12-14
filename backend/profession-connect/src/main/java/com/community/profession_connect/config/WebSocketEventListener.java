package com.community.profession_connect.config;

import com.community.profession_connect.service.OnlineUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.GenericMessage;
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

        // Robust way to get session attributes
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        // Fallback: Try extracting from native headers if direct access fails
        if (sessionAttributes == null || !sessionAttributes.containsKey("userId")) {
            GenericMessage<?> connectMessage = (GenericMessage<?>) headerAccessor.getHeader(SimpMessageHeaderAccessor.CONNECT_MESSAGE_HEADER);
            if (connectMessage != null) {
                SimpMessageHeaderAccessor connectAccessor = SimpMessageHeaderAccessor.wrap(connectMessage);
                sessionAttributes = connectAccessor.getSessionAttributes();
            }
        }

        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            Long userId = (Long) sessionAttributes.get("userId");

            // 1. Add user to the Online Map
            onlineUserService.userConnected(userId);
            System.out.println("[WebSocket] User Connected: " + userId);

            // 2. Broadcast the "ONLINE" status to everyone
            messagingTemplate.convertAndSend("/topic/online-status",
                    Map.of("userId", userId, "status", "ONLINE"));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            Long userId = (Long) sessionAttributes.get("userId");
            onlineUserService.userDisconnected(userId);
            System.out.println("[WebSocket] User Disconnected: " + userId);

            messagingTemplate.convertAndSend("/topic/online-status",
                    Map.of("userId", userId, "status", "OFFLINE"));
        }
    }
}