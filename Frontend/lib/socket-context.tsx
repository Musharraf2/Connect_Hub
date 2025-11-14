"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  chatRoom: string;
  sender: number;
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  readBy: Array<{ userId: number; readAt: Date }>;
  createdAt: Date;
}

interface UserStatus {
  userId: number;
  status: 'online' | 'offline';
  lastSeen: Date;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: Map<number, UserStatus>;
  registerUser: (userId: number) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: Message) => void;
  startTyping: (roomId: string, userId: number, userName: string) => void;
  stopTyping: (roomId: string, userId: number) => void;
  markAsRead: (roomId: string, messageId: string, userId: number) => void;
  initiateCall: (targetUserId: number, offer: RTCSessionDescriptionInit, callerId: number, callerName: string) => void;
  answerCall: (targetUserId: number, answer: RTCSessionDescriptionInit) => void;
  sendIceCandidate: (targetUserId: number, candidate: RTCIceCandidate) => void;
  endCall: (targetUserId: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, UserStatus>>(new Map());

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4000';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('user:status', (data: UserStatus) => {
      setOnlineUsers(prev => {
        const updated = new Map(prev);
        updated.set(data.userId, data);
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const registerUser = (userId: number) => {
    if (socket) {
      socket.emit('user:register', userId);
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('chat:join', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('chat:leave', roomId);
    }
  };

  const sendMessage = (roomId: string, message: Message) => {
    if (socket) {
      socket.emit('message:send', { chatRoomId: roomId, message });
    }
  };

  const startTyping = (roomId: string, userId: number, userName: string) => {
    if (socket) {
      socket.emit('typing:start', { chatRoomId: roomId, userId, userName });
    }
  };

  const stopTyping = (roomId: string, userId: number) => {
    if (socket) {
      socket.emit('typing:stop', { chatRoomId: roomId, userId });
    }
  };

  const markAsRead = (roomId: string, messageId: string, userId: number) => {
    if (socket) {
      socket.emit('message:read', { chatRoomId: roomId, messageId, userId });
    }
  };

  const initiateCall = (targetUserId: number, offer: RTCSessionDescriptionInit, callerId: number, callerName: string) => {
    if (socket) {
      socket.emit('call:initiate', { targetUserId, offer, callerId, callerName });
    }
  };

  const answerCall = (targetUserId: number, answer: RTCSessionDescriptionInit) => {
    if (socket) {
      socket.emit('call:answer', { targetUserId, answer });
    }
  };

  const sendIceCandidate = (targetUserId: number, candidate: RTCIceCandidate) => {
    if (socket) {
      socket.emit('call:ice-candidate', { targetUserId, candidate });
    }
  };

  const endCall = (targetUserId: number) => {
    if (socket) {
      socket.emit('call:end', { targetUserId });
    }
  };

  const value: SocketContextType = {
    socket,
    connected,
    onlineUsers,
    registerUser,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    initiateCall,
    answerCall,
    sendIceCandidate,
    endCall,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
