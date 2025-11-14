"use client"

import { useState, useEffect, useRef } from 'react';
import { LoginResponse } from '@/lib/api';
import { ChatRoom, Message, getRoomMessages, sendMessage as sendMessageAPI } from '@/lib/chat-api';
import { useSocket } from '@/lib/socket-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Info, Send, Image as ImageIcon, Mic, Phone, Video } from 'lucide-react';
import MessageItem from './message-item';
import ImageUpload from './image-upload';
import VoiceRecorder from './voice-recorder';

interface ChatAreaProps {
  currentUser: LoginResponse;
  selectedRoom: ChatRoom | null;
  onToggleInfo: () => void;
}

export default function ChatArea({ currentUser, selectedRoom, onToggleInfo }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, joinRoom, leaveRoom, sendMessage, startTyping, stopTyping, markAsRead } = useSocket();

  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      joinRoom(selectedRoom._id);

      return () => {
        leaveRoom(selectedRoom._id);
      };
    }
  }, [selectedRoom?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // Mark as read if not from current user
      if (message.sender !== currentUser.id && selectedRoom) {
        markAsRead(selectedRoom._id, message._id, currentUser.id);
      }
    };

    const handleTypingUpdate = (data: { userId: number; userName: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (data.isTyping) {
          updated.add(data.userName);
        } else {
          updated.delete(data.userName);
        }
        return updated;
      });
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('typing:update', handleTypingUpdate);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('typing:update', handleTypingUpdate);
    };
  }, [socket, selectedRoom, currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedRoom) return;
    try {
      const msgs = await getRoomMessages(selectedRoom._id);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!selectedRoom) return;

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      startTyping(selectedRoom._id, currentUser.id, currentUser.name);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(selectedRoom._id, currentUser.id);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedRoom) return;

    const messageData = {
      chatRoomId: selectedRoom._id,
      sender: currentUser.id,
      senderName: currentUser.name,
      content: inputMessage,
      messageType: 'text' as const,
    };

    try {
      const message = await sendMessageAPI(messageData);
      sendMessage(selectedRoom._id, message);
      setInputMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        stopTyping(selectedRoom._id, currentUser.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (url: string) => {
    if (!selectedRoom) return;

    const messageData = {
      chatRoomId: selectedRoom._id,
      sender: currentUser.id,
      senderName: currentUser.name,
      content: '',
      messageType: 'image' as const,
      mediaUrl: url,
    };

    try {
      const message = await sendMessageAPI(messageData);
      sendMessage(selectedRoom._id, message);
      setShowImageUpload(false);
    } catch (error) {
      console.error('Failed to send image:', error);
    }
  };

  const handleVoiceUpload = async (url: string) => {
    if (!selectedRoom) return;

    const messageData = {
      chatRoomId: selectedRoom._id,
      sender: currentUser.id,
      senderName: currentUser.name,
      content: '',
      messageType: 'voice' as const,
      mediaUrl: url,
    };

    try {
      const message = await sendMessageAPI(messageData);
      sendMessage(selectedRoom._id, message);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Select a chat to start messaging</p>
          <p className="text-sm mt-2">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {selectedRoom.isGroup ? selectedRoom.name?.[0] : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {selectedRoom.isGroup ? selectedRoom.name : 'Direct Chat'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedRoom.isGroup
                  ? `${selectedRoom.participants.length} members`
                  : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onToggleInfo}>
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <MessageItem
            key={message._id}
            message={message}
            isOwn={message.sender === currentUser.id}
          />
        ))}
        {typingUsers.size > 0 && (
          <div className="text-sm text-muted-foreground italic">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowImageUpload(true)}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowVoiceRecorder(true)}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      {showImageUpload && (
        <ImageUpload
          onUpload={handleImageUpload}
          onClose={() => setShowImageUpload(false)}
        />
      )}
      {showVoiceRecorder && (
        <VoiceRecorder
          onUpload={handleVoiceUpload}
          onClose={() => setShowVoiceRecorder(false)}
        />
      )}
    </div>
  );
}
