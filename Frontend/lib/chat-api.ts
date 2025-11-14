// Chat API functions
const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4000';

export interface ChatRoom {
  _id: string;
  name?: string;
  isGroup: boolean;
  participants: number[];
  community: string;
  createdBy: number;
  lastMessage?: Message;
  lastMessageTime?: Date;
  createdAt: Date;
}

export interface Message {
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

// Get all chat rooms for a user
export const getUserChatRooms = async (userId: number): Promise<ChatRoom[]> => {
  const response = await fetch(`${CHAT_API_URL}/api/chat/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chat rooms');
  }
  return response.json();
};

// Get community chat rooms
export const getCommunityChatRooms = async (community: string): Promise<ChatRoom[]> => {
  const response = await fetch(`${CHAT_API_URL}/api/chat/community/${community}`);
  if (!response.ok) {
    throw new Error('Failed to fetch community chat rooms');
  }
  return response.json();
};

// Create or get direct chat
export const createOrGetDirectChat = async (
  userId1: number,
  userId2: number,
  community: string
): Promise<ChatRoom> => {
  const response = await fetch(`${CHAT_API_URL}/api/chat/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId1, userId2, community }),
  });
  if (!response.ok) {
    throw new Error('Failed to create/get direct chat');
  }
  return response.json();
};

// Create group chat
export const createGroupChat = async (
  name: string,
  participants: number[],
  community: string,
  createdBy: number
): Promise<ChatRoom> => {
  const response = await fetch(`${CHAT_API_URL}/api/chat/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, participants, community, createdBy }),
  });
  if (!response.ok) {
    throw new Error('Failed to create group chat');
  }
  return response.json();
};

// Join group chat
export const joinGroupChat = async (chatRoomId: string, userId: number): Promise<ChatRoom> => {
  const response = await fetch(`${CHAT_API_URL}/api/chat/${chatRoomId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error('Failed to join group chat');
  }
  return response.json();
};

// Get messages for a chat room
export const getRoomMessages = async (
  chatRoomId: string,
  limit = 50,
  skip = 0
): Promise<Message[]> => {
  const response = await fetch(
    `${CHAT_API_URL}/api/messages/room/${chatRoomId}?limit=${limit}&skip=${skip}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
};

// Send a message
export const sendMessage = async (messageData: {
  chatRoomId: string;
  sender: number;
  senderName: string;
  content: string;
  messageType?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
}): Promise<Message> => {
  const response = await fetch(`${CHAT_API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};

// Mark message as read
export const markMessageAsRead = async (messageId: string, userId: number): Promise<Message> => {
  const response = await fetch(`${CHAT_API_URL}/api/messages/${messageId}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark message as read');
  }
  return response.json();
};

// Upload image
export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${CHAT_API_URL}/api/upload/image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
  return response.json();
};

// Upload voice message
export const uploadVoiceMessage = async (blob: Blob): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', blob, 'voice-message.webm');

  const response = await fetch(`${CHAT_API_URL}/api/upload/voice`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload voice message');
  }
  return response.json();
};
