package com.community.profession_connect.service;

import com.community.profession_connect.dto.ConnectionResponse;
import com.community.profession_connect.model.Connection;
import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.ConnectionRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    public String sendConnectionRequest(Long requesterId, Long receiverId) {
        Optional<User> requesterOpt = userRepository.findById(requesterId);
        Optional<User> receiverOpt = userRepository.findById(receiverId);

        if (requesterOpt.isEmpty() || receiverOpt.isEmpty()) {
            return "User not found";
        }

        User requester = requesterOpt.get();
        User receiver = receiverOpt.get();

        // Check if connection already exists in either direction
        List<Connection> existingConnections = connectionRepository.findByRequesterAndReceiverOrReceiverAndRequester(
            requester, receiver, requester, receiver
        );
        
        if (!existingConnections.isEmpty()) {
            return "Request already sent";
        }

        // Create new connection
        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setReceiver(receiver);
        connection.setStatus(ConnectionStatus.PENDING);
        connectionRepository.save(connection);

        return "Connection request sent successfully";
    }

    public String acceptConnectionRequest(Long connectionId) {
        Optional<Connection> connectionOpt = connectionRepository.findById(connectionId);

        if (connectionOpt.isEmpty()) {
            return "Connection not found";
        }

        Connection connection = connectionOpt.get();

        if (!connection.getStatus().equals(ConnectionStatus.PENDING)) {
            return "Connection is not pending";
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        connectionRepository.save(connection);

        return "Connection request accepted";
    }

    public String declineConnectionRequest(Long connectionId) {
        Optional<Connection> connectionOpt = connectionRepository.findById(connectionId);

        if (connectionOpt.isEmpty()) {
            return "Connection not found";
        }

        connectionRepository.deleteById(connectionId);
        return "Connection request declined";
    }

    public List<ConnectionResponse> getPendingRequests(Long receiverId) {
        Optional<User> receiverOpt = userRepository.findById(receiverId);

        if (receiverOpt.isEmpty()) {
            return List.of();
        }

        User receiver = receiverOpt.get();
        List<Connection> connections = connectionRepository.findByReceiverAndStatus(receiver, ConnectionStatus.PENDING);
        
        return connections.stream()
            .map(ConnectionResponse::fromConnection)
            .collect(Collectors.toList());
    }

    public List<ConnectionResponse> getSentPendingRequests(Long requesterId) {
        Optional<User> requesterOpt = userRepository.findById(requesterId);

        if (requesterOpt.isEmpty()) {
            return List.of();
        }

        User requester = requesterOpt.get();
        List<Connection> connections = connectionRepository.findByRequesterAndStatus(requester, ConnectionStatus.PENDING);
        
        return connections.stream()
            .map(ConnectionResponse::fromConnection)
            .collect(Collectors.toList());
    }

    public List<ConnectionResponse> getAcceptedConnections(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return List.of();
        }

        User user = userOpt.get();
        List<Connection> connections = connectionRepository.findByReceiverAndStatusOrRequesterAndStatus(
            user, ConnectionStatus.ACCEPTED, user, ConnectionStatus.ACCEPTED
        );
        
        return connections.stream()
            .map(ConnectionResponse::fromConnection)
            .collect(Collectors.toList());
    }
}
