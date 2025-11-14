"use client"

import { useState, useEffect } from 'react';
import { LoginResponse, getUsersByProfession, UserProfileResponse } from '@/lib/api';
import { getUserChatRooms, createOrGetDirectChat, createGroupChat, ChatRoom } from '@/lib/chat-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Users, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSidebarProps {
  currentUser: LoginResponse;
  selectedRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
}

export default function ChatSidebar({ currentUser, selectedRoom, onSelectRoom }: ChatSidebarProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [communityUsers, setCommunityUsers] = useState<UserProfileResponse[]>([]);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  useEffect(() => {
    loadChatRooms();
    loadCommunityUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const loadChatRooms = async () => {
    try {
      const rooms = await getUserChatRooms(currentUser.id);
      setChatRooms(rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    }
  };

  const loadCommunityUsers = async () => {
    try {
      const users = await getUsersByProfession(currentUser.profession);
      // Filter out current user
      const filteredUsers = users.filter(user => user.id !== currentUser.id);
      setCommunityUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load community users:', error);
    }
  };

  const handleStartDirectChat = async (userId: number) => {
    try {
      const room = await createOrGetDirectChat(currentUser.id, userId, currentUser.profession);
      setChatRooms(prev => {
        const exists = prev.find(r => r._id === room._id);
        if (exists) return prev;
        return [room, ...prev];
      });
      onSelectRoom(room);
      setShowNewChatDialog(false);
    } catch (error) {
      console.error('Failed to start direct chat:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      const participants = [currentUser.id, ...selectedUsers];
      const room = await createGroupChat(groupName, participants, currentUser.profession, currentUser.id);
      setChatRooms(prev => [room, ...prev]);
      onSelectRoom(room);
      setShowGroupDialog(false);
      setGroupName('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredRooms = chatRooms.filter(room => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (room.isGroup) {
      return room.name?.toLowerCase().includes(query);
    }
    // For direct chats, search by participant name (would need to fetch user details)
    return true;
  });

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-80 border-r border-border flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold">Chats</h2>
          <div className="flex gap-2">
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {communityUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleStartDirectChat(user.id)}
                      >
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.profession}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Users className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Group Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2">
                      {communityUsers.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4"
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button
                    className="w-full"
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || selectedUsers.length === 0}
                  >
                    Create Group ({selectedUsers.length} members)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start a conversation!</p>
            </div>
          ) : (
            filteredRooms.map(room => (
              <div
                key={room._id}
                className={`p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                  selectedRoom?._id === room._id
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {room.isGroup ? <Users className="w-4 h-4" /> : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {room.isGroup ? room.name : 'Direct Chat'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(room.lastMessageTime)}
                      </span>
                    </div>
                    {room.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {room.lastMessage.messageType === 'text'
                          ? room.lastMessage.content
                          : room.lastMessage.messageType === 'image'
                          ? '📷 Image'
                          : '🎤 Voice message'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
