import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWebSocket } from './useWebSocket';

export function useOnlineStatus(currentUserId?: number) {
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  // 1. Initial Fetch (REST API)
  useEffect(() => {
    if (!currentUserId) return;

    const fetchStatus = async () => {
      try {
        const res = await axios.get<number[]>('http://localhost:8080/api/users/online-status');
        setOnlineUsers(new Set(res.data));
      } catch (error) {
        console.error("Failed to fetch online users", error);
      }
    };

    fetchStatus();
  }, [currentUserId]);

  // 2. Real-time Updates (WebSocket)
  useWebSocket({
    url: 'http://localhost:8080/ws',
    userId: currentUserId,
    topics: ['/topic/online-status'],
    enabled: !!currentUserId,
    onMessage: (topic, message) => {
      if (topic === '/topic/online-status') {
        const { userId, status } = message;
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (status === 'ONLINE') {
            newSet.add(Number(userId));
          } else {
            newSet.delete(Number(userId));
          }
          return newSet;
        });
      }
    },
  });

  // 3. Helper to check status
  const isUserOnline = (userId: number) => onlineUsers.has(userId);

  return { onlineUsers, isUserOnline };
}