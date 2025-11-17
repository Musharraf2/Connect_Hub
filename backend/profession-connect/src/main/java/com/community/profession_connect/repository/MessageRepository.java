package com.community.profession_connect.repository;

import com.community.profession_connect.model.Message;
import com.community.profession_connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get all messages between two users, ordered by timestamp
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Get count of unread messages for a specific user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("userId") Long userId);

    // Get all users who have conversations with the given user, ordered by latest message
    @Query("SELECT DISTINCT CASE " +
           "WHEN m.sender.id = :userId THEN m.receiver " +
           "ELSE m.sender END " +
           "FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<User> findUsersWithConversations(@Param("userId") Long userId);

    // Get the last message between current user and another user
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
           "ORDER BY m.timestamp DESC")
    List<Message> findLastMessageBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Count unread messages from a specific user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.isRead = false")
    Long countUnreadMessagesFrom(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);
}
