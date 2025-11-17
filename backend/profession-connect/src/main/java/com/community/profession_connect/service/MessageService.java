package com.community.profession_connect.service;

import com.community.profession_connect.dto.ConversationResponse;
import com.community.profession_connect.dto.MessageRequest;
import com.community.profession_connect.dto.MessageResponse;
import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.model.Message;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.ConnectionRepository;
import com.community.profession_connect.repository.MessageRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConnectionRepository connectionRepository;

    @Transactional
    public MessageResponse sendMessage(MessageRequest request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setRead(false);

        Message savedMessage = messageRepository.save(message);
        return convertToMessageResponse(savedMessage);
    }

    public List<MessageResponse> getConversation(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(userId1, userId2);
        return messages.stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markMessagesAsRead(Long receiverId, Long senderId) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(receiverId, senderId);
        for (Message message : messages) {
            if (message.getReceiver().getId().equals(receiverId) && !message.isRead()) {
                message.setRead(true);
                messageRepository.save(message);
            }
        }
    }

    public Long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    public List<ConversationResponse> getConversations(Long userId) {
        try {
            // Get all accepted connections for the user
            List<User> connectedUsers = connectionRepository.findAcceptedConnectionUsers(userId, ConnectionStatus.ACCEPTED);
            
            if (connectedUsers.isEmpty()) {
                System.out.println("No connected users found for user " + userId);
                return new ArrayList<>();
            }
            
            System.out.println("Found " + connectedUsers.size() + " connected users for user " + userId);
            
            List<ConversationResponse> conversations = new ArrayList<>();
            
            for (User user : connectedUsers) {
                try {
                    List<Message> lastMessages = messageRepository.findLastMessageBetweenUsers(userId, user.getId());
                    
                    ConversationResponse conversation = new ConversationResponse();
                    conversation.setUserId(user.getId());
                    conversation.setUserName(user.getName());
                    conversation.setUserProfileImageUrl(user.getProfileImageUrl());
                    conversation.setOnline(false); // Will be updated via WebSocket
                    
                    if (!lastMessages.isEmpty()) {
                        Message lastMessage = lastMessages.get(0);
                        Long unreadCount = messageRepository.countUnreadMessagesFrom(userId, user.getId());
                        
                        conversation.setLastMessage(lastMessage.getContent());
                        conversation.setLastMessageTime(lastMessage.getTimestamp());
                        conversation.setUnreadCount(unreadCount);
                    } else {
                        // User is connected but no messages yet
                        conversation.setLastMessage("");
                        conversation.setLastMessageTime(null);
                        conversation.setUnreadCount(0L);
                    }
                    
                    conversations.add(conversation);
                    System.out.println("Added conversation for user: " + user.getName() + " (messages: " + !lastMessages.isEmpty() + ")");
                } catch (Exception e) {
                    // Log error but continue with other conversations
                    System.err.println("Error fetching conversation for user " + user.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Sort: users with messages first (by timestamp DESC), then users without messages (by name ASC)
            conversations.sort((c1, c2) -> {
                boolean c1HasMessages = c1.getLastMessageTime() != null;
                boolean c2HasMessages = c2.getLastMessageTime() != null;
                
                // Both have messages: sort by timestamp descending (latest first)
                if (c1HasMessages && c2HasMessages) {
                    return c2.getLastMessageTime().compareTo(c1.getLastMessageTime());
                }
                
                // Only c1 has messages: c1 comes first
                if (c1HasMessages) {
                    return -1;
                }
                
                // Only c2 has messages: c2 comes first
                if (c2HasMessages) {
                    return 1;
                }
                
                // Neither has messages: sort alphabetically by name
                return c1.getUserName().compareToIgnoreCase(c2.getUserName());
            });
            
            System.out.println("Returning " + conversations.size() + " conversations");
            return conversations;
        } catch (Exception e) {
            System.err.println("Error fetching conversations for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing exception
            return new ArrayList<>();
        }
    }

    private MessageResponse convertToMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getName());
        response.setSenderProfileImageUrl(message.getSender().getProfileImageUrl());
        response.setReceiverId(message.getReceiver().getId());
        response.setReceiverName(message.getReceiver().getName());
        response.setReceiverProfileImageUrl(message.getReceiver().getProfileImageUrl());
        response.setContent(message.getContent());
        response.setTimestamp(message.getTimestamp());
        response.setRead(message.isRead());
        return response;
    }
}
