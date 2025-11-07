package com.community.profession_connect.repository;

import com.community.profession_connect.model.Connection;
import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByRequesterAndReceiver(User requester, User receiver);
    
    List<Connection> findByReceiverAndStatus(User receiver, ConnectionStatus status);
    
    List<Connection> findByReceiverAndStatusOrRequesterAndStatus(
        User receiver, 
        ConnectionStatus status1, 
        User requester, 
        ConnectionStatus status2
    );
}
