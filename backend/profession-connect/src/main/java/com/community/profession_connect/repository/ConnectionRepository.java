package com.community.profession_connect.repository;

import com.community.profession_connect.model.Connection;
import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByRequesterAndReceiver(User requester, User receiver);

    List<Connection> findByReceiverAndStatus(User receiver, ConnectionStatus status);

    List<Connection> findByRequesterAndStatus(User requester, ConnectionStatus status);

    List<Connection> findByReceiverAndStatusOrRequesterAndStatus(
            User receiver,
            ConnectionStatus status1,
            User requester,
            ConnectionStatus status2
    );

    List<Connection> findByRequesterAndReceiverOrReceiverAndRequester(
            User requester1,
            User receiver1,
            User requester2,
            User receiver2
    );

    // --- ADD THESE TWO NEW METHODS ---

    // Counts pending requests for the user
    int countByReceiverAndStatus(User receiver, ConnectionStatus status);

    // Counts all accepted connections (where user is either requester or receiver)
    int countByReceiverAndStatusOrRequesterAndStatus(
            User receiver,
            ConnectionStatus status1,
            User requester,
            ConnectionStatus status2
    );

    // Get all accepted connections for a user
    @Query("SELECT c FROM Connection c WHERE c.status = 'ACCEPTED' AND (c.requester.id = :userId OR c.receiver.id = :userId)")
    List<Connection> findAcceptedConnectionsByUserId(@Param("userId") Long userId);

    // Find connection between two users (regardless of who initiated)
    @Query("SELECT c FROM Connection c WHERE " +
           "(c.requester.id = :userId1 AND c.receiver.id = :userId2) OR " +
           "(c.requester.id = :userId2 AND c.receiver.id = :userId1)")
    List<Connection> findConnectionBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}