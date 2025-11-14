"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SocketProvider } from '@/lib/socket-context';
import { LoginResponse } from '@/lib/api';
import ChatLayout from '@/components/chat/chat-layout';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
      router.push('/login');
    } else {
      const user: LoginResponse = JSON.parse(userDataString);
      setCurrentUser(user);
      setLoading(false);
    }
  }, [router]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <SocketProvider>
      <ChatLayout currentUser={currentUser} />
    </SocketProvider>
  );
}
