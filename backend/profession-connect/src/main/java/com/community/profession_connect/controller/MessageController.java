package com.community.profession_connect.controller;

import com.community.profession_connect.dto.ConversationSummary;
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

    // Send a message via REST API (also works with WebSocket)
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {
        try {
            MessageResponse response = messageService.sendMessage(request);
            // Send the message via WebSocket to the receiver
            messagingTemplate.convertAndSend(
                    "/queue/messages/" + request.getReceiverId(),
                    response
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get conversation between two users
    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            List<MessageResponse> messages = messageService.getConversation(userId1, userId2);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get list of all conversations for a user
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationSummary>> getConversationList(@PathVariable Long userId) {
        try {
            List<ConversationSummary> conversations = messageService.getConversationList(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mark messages as read
    @PutMapping("/read/{receiverId}/{senderId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long receiverId,
            @PathVariable Long senderId) {
        try {
            messageService.markMessagesAsRead(receiverId, senderId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // WebSocket endpoint for sending messages
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(@Payload MessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);
        // Send to the specific receiver
        messagingTemplate.convertAndSend(
                "/queue/messages/" + request.getReceiverId(),
                response
        );
        // Also send back to sender for confirmation
        messagingTemplate.convertAndSend(
                "/queue/messages/" + request.getSenderId(),
                response
        );
    }
}
