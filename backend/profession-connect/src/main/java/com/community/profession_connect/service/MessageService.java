package com.community.profession_connect.service;

import com.community.profession_connect.dto.ConversationSummary;
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
import java.util.Comparator;
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
        if (!areUsersConnected(request.getSenderId(), request.getReceiverId())) {
            throw new RuntimeException("Users are not connected");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setIsRead(false);

        Message savedMessage = messageRepository.save(message);
        return convertToResponse(savedMessage);
    }

    public List<MessageResponse> getConversation(Long userId1, Long userId2) {
        // Verify that users are connected
        if (!areUsersConnected(userId1, userId2)) {
            throw new RuntimeException("Users are not connected");
        }

        List<Message> messages = messageRepository.findConversationBetweenUsers(userId1, userId2);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markMessagesAsRead(Long receiverId, Long senderId) {
        List<Message> unreadMessages = messageRepository.findUnreadMessages(receiverId, senderId);
        for (Message message : unreadMessages) {
            message.setIsRead(true);
        }
        messageRepository.saveAll(unreadMessages);
    }

    public List<ConversationSummary> getConversationList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all accepted connections for this user
        List<Connection> connections = connectionRepository.findAcceptedConnectionsByUserId(userId);

        List<ConversationSummary> summaries = new ArrayList<>();

        for (Connection connection : connections) {
            // Get the other user in the connection
            User otherUser = connection.getRequester().getId().equals(userId) 
                    ? connection.getReceiver() 
                    : connection.getRequester();

            // Get last message between users
            List<Message> lastMessages = messageRepository.findLastMessageBetweenUsers(userId, otherUser.getId());
            
            String lastMessage = "";
            java.time.LocalDateTime lastMessageTime = null;
            
            if (!lastMessages.isEmpty()) {
                Message last = lastMessages.get(0);
                lastMessage = last.getContent();
                lastMessageTime = last.getTimestamp();
            }

            // Get unread count
            Long unreadCount = messageRepository.countUnreadMessages(userId, otherUser.getId());

            ConversationSummary.UserInfo userInfo = new ConversationSummary.UserInfo(
                    otherUser.getId(),
                    otherUser.getName(),
                    otherUser.getProfession(),
                    otherUser.getProfileImageUrl()
            );

            ConversationSummary summary = new ConversationSummary(
                    userInfo,
                    lastMessage,
                    lastMessageTime,
                    unreadCount
            );

            summaries.add(summary);
        }

        // Sort by last message time (most recent first)
        summaries.sort(Comparator.comparing(ConversationSummary::getLastMessageTime, 
                Comparator.nullsLast(Comparator.reverseOrder())));

        return summaries;
    }

    private boolean areUsersConnected(Long userId1, Long userId2) {
        List<Connection> connections = connectionRepository.findConnectionBetweenUsers(userId1, userId2);
        return connections.stream()
                .anyMatch(conn -> conn.getStatus() == ConnectionStatus.ACCEPTED);
    }

    private MessageResponse convertToResponse(Message message) {
        MessageResponse.UserInfo senderInfo = new MessageResponse.UserInfo(
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getEmail(),
                message.getSender().getProfession(),
                message.getSender().getProfileImageUrl()
        );

        MessageResponse.UserInfo receiverInfo = new MessageResponse.UserInfo(
                message.getReceiver().getId(),
                message.getReceiver().getName(),
                message.getReceiver().getEmail(),
                message.getReceiver().getProfession(),
                message.getReceiver().getProfileImageUrl()
        );

        return new MessageResponse(
                message.getId(),
                senderInfo,
                receiverInfo,
                message.getContent(),
                message.getTimestamp(),
                message.getIsRead()
        );
    }
}
