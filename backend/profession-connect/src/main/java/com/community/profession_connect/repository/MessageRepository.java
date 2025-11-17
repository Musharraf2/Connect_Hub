package com.community.profession_connect.repository;

import com.community.profession_connect.model.Message;
import com.community.profession_connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Find all messages between two users
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) " +
           "OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Count unread messages for a user from a specific sender
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.isRead = false")
    Long countUnreadMessages(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);

    // Find the last message between two users
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) " +
           "OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.timestamp DESC LIMIT 1")
    Message findLastMessageBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Mark messages as read
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.isRead = false")
    void markMessagesAsRead(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);
}
