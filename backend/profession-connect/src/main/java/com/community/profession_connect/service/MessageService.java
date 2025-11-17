package com.community.profession_connect.service;

import com.community.profession_connect.dto.ChatUserResponse;
import com.community.profession_connect.dto.MessageRequest;
import com.community.profession_connect.dto.MessageResponse;
import com.community.profession_connect.model.Connection;
import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.model.Message;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.ConnectionRepository;
import com.community.profession_connect.repository.MessageRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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

        // Verify that users are connected
        if (!areUsersConnected(sender.getId(), receiver.getId())) {
            throw new RuntimeException("Users are not connected");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setRead(false);

        Message savedMessage = messageRepository.save(message);

        return convertToResponse(savedMessage);
    }

    public List<MessageResponse> getMessagesBetweenUsers(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(userId1, userId2);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ChatUserResponse> getChatUsers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all accepted connections
        List<Connection> connections = connectionRepository.findByRequesterOrReceiver(user, user);
        List<Connection> acceptedConnections = connections.stream()
                .filter(conn -> conn.getStatus() == ConnectionStatus.ACCEPTED)
                .collect(Collectors.toList());

        List<ChatUserResponse> chatUsers = new ArrayList<>();

        for (Connection connection : acceptedConnections) {
            User otherUser = connection.getRequester().getId().equals(userId)
                    ? connection.getReceiver()
                    : connection.getRequester();

            // Get last message
            Message lastMessage = messageRepository.findLastMessageBetweenUsers(userId, otherUser.getId());
            
            // Count unread messages
            Long unreadCount = messageRepository.countUnreadMessages(userId, otherUser.getId());

            ChatUserResponse chatUser = new ChatUserResponse();
            chatUser.setId(otherUser.getId());
            chatUser.setName(otherUser.getName());
            chatUser.setEmail(otherUser.getEmail());
            chatUser.setProfession(otherUser.getProfession());
            chatUser.setProfileImageUrl(otherUser.getProfileImageUrl());
            chatUser.setLastMessage(lastMessage != null ? lastMessage.getContent() : null);
            chatUser.setUnreadCount(unreadCount);

            chatUsers.add(chatUser);
        }

        return chatUsers;
    }

    @Transactional
    public void markMessagesAsRead(Long receiverId, Long senderId) {
        messageRepository.markMessagesAsRead(receiverId, senderId);
    }

    public Long getTotalUnreadMessageCount(Long userId) {
        return messageRepository.countTotalUnreadMessages(userId);
    }

    private boolean areUsersConnected(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElse(null);
        User user2 = userRepository.findById(userId2).orElse(null);
        
        if (user1 == null || user2 == null) {
            return false;
        }

        List<Connection> connections = connectionRepository.findByRequesterOrReceiver(user1, user1);
        
        return connections.stream()
                .anyMatch(conn -> 
                    conn.getStatus() == ConnectionStatus.ACCEPTED &&
                    ((conn.getRequester().getId().equals(userId1) && conn.getReceiver().getId().equals(userId2)) ||
                     (conn.getRequester().getId().equals(userId2) && conn.getReceiver().getId().equals(userId1)))
                );
    }

    private MessageResponse convertToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getName());
        response.setReceiverId(message.getReceiver().getId());
        response.setReceiverName(message.getReceiver().getName());
        response.setContent(message.getContent());
        response.setTimestamp(message.getTimestamp());
        response.setRead(message.isRead());
        return response;
    }
}
