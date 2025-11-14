"use client"

import { ChatRoom } from '@/lib/chat-api';
import { LoginResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Users, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInfoProps {
  room: ChatRoom;
  currentUser: LoginResponse;
  onClose: () => void;
}

export default function ChatInfo({ room, currentUser, onClose }: ChatInfoProps) {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Chat Info</h2>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Group/Chat Info */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {room.isGroup ? <Users className="w-8 h-8" /> : 'U'}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">
              {room.isGroup ? room.name : 'Direct Chat'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {room.community} community
            </p>
          </div>

          {/* Members */}
          {room.isGroup && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members ({room.participants.length})
              </h4>
              <div className="space-y-2">
                {room.participants.map(participantId => (
                  <div
                    key={participantId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {participantId === currentUser.id ? 'You' : `User ${participantId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participantId === room.createdBy && 'Admin'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Shared Media
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {/* Placeholder for shared media */}
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              Search in Conversation
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Mute Notifications
            </Button>
            {room.isGroup && room.createdBy !== currentUser.id && (
              <Button variant="destructive" className="w-full" size="sm">
                Leave Group
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
