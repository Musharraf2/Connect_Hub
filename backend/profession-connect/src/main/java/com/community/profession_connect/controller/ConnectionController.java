package com.community.profession_connect.controller;

import com.community.profession_connect.dto.ConnectionResponse;
import com.community.profession_connect.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    @PostMapping("/send")
    public ResponseEntity<String> sendConnectionRequest(
        @RequestParam Long requesterId, 
        @RequestParam Long receiverId
    ) {
        String message = connectionService.sendConnectionRequest(requesterId, receiverId);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/accept/{connectionId}")
    public ResponseEntity<String> acceptConnectionRequest(@PathVariable Long connectionId) {
        String message = connectionService.acceptConnectionRequest(connectionId);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/decline/{connectionId}")
    public ResponseEntity<String> declineConnectionRequest(@PathVariable Long connectionId) {
        String message = connectionService.declineConnectionRequest(connectionId);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/pending/{receiverId}")
    public ResponseEntity<List<ConnectionResponse>> getPendingRequests(@PathVariable Long receiverId) {
        List<ConnectionResponse> requests = connectionService.getPendingRequests(receiverId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/sent-pending/{requesterId}")
    public ResponseEntity<List<ConnectionResponse>> getSentPendingRequests(@PathVariable Long requesterId) {
        List<ConnectionResponse> requests = connectionService.getSentPendingRequests(requesterId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/accepted/{userId}")
    public ResponseEntity<List<ConnectionResponse>> getAcceptedConnections(@PathVariable Long userId) {
        List<ConnectionResponse> connections = connectionService.getAcceptedConnections(userId);
        return ResponseEntity.ok(connections);
    }
}
