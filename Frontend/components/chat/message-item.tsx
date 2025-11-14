"use client"

import { Message } from '@/lib/chat-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageItem({ message, isOwn }: MessageItemProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isRead = message.readBy && message.readBy.length > 0;

  return (
    <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
      <Avatar className="w-8 h-8">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback className="text-xs">
          {message.senderName.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.senderName}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {message.messageType === 'text' && (
            <p className="text-sm break-words">{message.content}</p>
          )}

          {message.messageType === 'image' && message.mediaUrl && (
            <div className="space-y-2">
              {message.content && (
                <p className="text-sm break-words">{message.content}</p>
              )}
              <img
                src={message.mediaUrl}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto max-h-96 object-contain"
              />
            </div>
          )}

          {message.messageType === 'voice' && message.mediaUrl && (
            <div className="space-y-2">
              <audio controls className="w-full max-w-xs">
                <source src={message.mediaUrl} type="audio/webm" />
                <source src={message.mediaUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {isRead ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
