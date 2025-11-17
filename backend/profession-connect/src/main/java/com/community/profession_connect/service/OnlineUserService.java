package com.community.profession_connect.service;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineUserService {
    
    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();
    
    public void userConnected(Long userId) {
        onlineUsers.add(userId);
        System.out.println("User connected: " + userId + ", Total online: " + onlineUsers.size());
    }
    
    public void userDisconnected(Long userId) {
        onlineUsers.remove(userId);
        System.out.println("User disconnected: " + userId + ", Total online: " + onlineUsers.size());
    }
    
    public boolean isUserOnline(Long userId) {
        return onlineUsers.contains(userId);
    }
    
    public Set<Long> getOnlineUsers() {
        return Set.copyOf(onlineUsers);
    }
}
