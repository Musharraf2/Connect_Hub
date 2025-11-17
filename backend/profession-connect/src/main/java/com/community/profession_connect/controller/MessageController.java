package com.community.profession_connect.controller;

import com.community.profession_connect.dto.ChatUserResponse;
import com.community.profession_connect.dto.MessageRequest;
import com.community.profession_connect.dto.MessageResponse;
import com.community.profession_connect.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // REST endpoint to send a message
    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);
        
        // Send the message to the receiver via WebSocket
        messagingTemplate.convertAndSendToUser(
            response.getReceiverId().toString(),
            "/queue/messages",
            response
        );
        
        return ResponseEntity.ok(response);
    }

    // WebSocket endpoint to send messages in real-time
    @MessageMapping("/chat")
    public void sendMessageViaWebSocket(@Payload MessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);
        
        // Send to receiver
        messagingTemplate.convertAndSendToUser(
            response.getReceiverId().toString(),
            "/queue/messages",
            response
        );
        
        // Send confirmation back to sender
        messagingTemplate.convertAndSendToUser(
            response.getSenderId().toString(),
            "/queue/messages",
            response
        );
    }

    // Get message history between two users
    @GetMapping("/history/{userId1}/{userId2}")
    public ResponseEntity<List<MessageResponse>> getMessageHistory(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        List<MessageResponse> messages = messageService.getMessagesBetweenUsers(userId1, userId2);
        return ResponseEntity.ok(messages);
    }

    // Get all chat users (connections) for a user
    @GetMapping("/chat-users/{userId}")
    public ResponseEntity<List<ChatUserResponse>> getChatUsers(@PathVariable Long userId) {
        List<ChatUserResponse> chatUsers = messageService.getChatUsers(userId);
        return ResponseEntity.ok(chatUsers);
    }

    // Mark messages as read
    @PutMapping("/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(
            @RequestParam Long receiverId,
            @RequestParam Long senderId) {
        messageService.markMessagesAsRead(receiverId, senderId);
        return ResponseEntity.ok().build();
    }
}
