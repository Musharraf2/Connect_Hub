package com.community.profession_connect.controller;

import com.community.profession_connect.dto.ConversationResponse;
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
        
        // Send via WebSocket to the receiver
        messagingTemplate.convertAndSend("/queue/messages/" + request.getReceiverId(), response);
        
        // Also send back to sender for confirmation
        messagingTemplate.convertAndSend("/queue/messages/" + request.getSenderId(), response);
        
        return ResponseEntity.ok(response);
    }

    // WebSocket endpoint to send a message
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(@Payload MessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);
        
        // Send to receiver
        messagingTemplate.convertAndSend("/queue/messages/" + request.getReceiverId(), response);
        
        // Send to sender
        messagingTemplate.convertAndSend("/queue/messages/" + request.getSenderId(), response);
    }

    // Get conversation between two users
    @GetMapping("/conversation")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @RequestParam Long userId1,
            @RequestParam Long userId2) {
        List<MessageResponse> messages = messageService.getConversation(userId1, userId2);
        return ResponseEntity.ok(messages);
    }

    // Get all conversations for a user
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponse>> getConversations(@PathVariable Long userId) {
        List<ConversationResponse> conversations = messageService.getConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    // Mark messages as read
    @PutMapping("/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(
            @RequestParam Long receiverId,
            @RequestParam Long senderId) {
        messageService.markMessagesAsRead(receiverId, senderId);
        
        // Notify sender that messages were read
        messagingTemplate.convertAndSend("/queue/read/" + senderId, receiverId);
        
        return ResponseEntity.ok().build();
    }

    // Get unread message count
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        Long count = messageService.getUnreadMessageCount(userId);
        return ResponseEntity.ok(count);
    }

    // Delete a message
    @DeleteMapping("/{messageId}")
    public ResponseEntity<String> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        Long receiverId = messageService.deleteMessage(messageId, userId);
        
        // Notify both sender and receiver via WebSocket
        messagingTemplate.convertAndSend("/queue/delete/" + userId, messageId);
        messagingTemplate.convertAndSend("/queue/delete/" + receiverId, messageId);
        
        return ResponseEntity.ok("Message deleted successfully");
    }
}
