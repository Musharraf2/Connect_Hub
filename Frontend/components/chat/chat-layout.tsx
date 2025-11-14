"use client"

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket-context';
import { LoginResponse } from '@/lib/api';
import { ChatRoom } from '@/lib/chat-api';
import ChatSidebar from './chat-sidebar';
import ChatArea from './chat-area';
import ChatInfo from './chat-info';
import { Header } from '@/components/header';

interface ChatLayoutProps {
  currentUser: LoginResponse;
}

export default function ChatLayout({ currentUser }: ChatLayoutProps) {
  const { registerUser } = useSocket();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Register user with socket when component mounts
    registerUser(currentUser.id);
  }, [currentUser.id, registerUser]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        user={{
          name: currentUser.name,
          avatar: '/placeholder.svg',
          community: currentUser.profession,
          pendingRequests: 0
        }} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chat List */}
        <ChatSidebar
          currentUser={currentUser}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
        />

        {/* Middle - Chat Area */}
        <ChatArea
          currentUser={currentUser}
          selectedRoom={selectedRoom}
          onToggleInfo={() => setShowInfo(!showInfo)}
        />

        {/* Right Sidebar - Chat Info */}
        {showInfo && selectedRoom && (
          <ChatInfo
            room={selectedRoom}
            currentUser={currentUser}
            onClose={() => setShowInfo(false)}
          />
        )}
      </div>
    </div>
  );
}
