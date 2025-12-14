package com.community.profession_connect.service;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineUserService {

    // ConcurrentKeySet is thread-safe and efficient
    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();

    public void userConnected(Long userId) {
        if (userId != null) {
            onlineUsers.add(userId);
            System.out.println("User connected: " + userId + ", Total online: " + onlineUsers.size());
        }
    }

    public void userDisconnected(Long userId) {
        if (userId != null) {
            onlineUsers.remove(userId);
            System.out.println("User disconnected: " + userId + ", Total online: " + onlineUsers.size());
        }
    }

    public boolean isUserOnline(Long userId) {
        return userId != null && onlineUsers.contains(userId);
    }

    // Fix: Expose this so Controller can send the initial list to Frontend
    public Set<Long> getOnlineUsers() {
        return Set.copyOf(onlineUsers);
    }
}