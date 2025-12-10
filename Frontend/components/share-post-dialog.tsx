"use client";

import { useState, useEffect, useCallback } from "react";
import { Share2, Copy, MessageCircle, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getAcceptedConnections, sendMessage, Connection, PostResponse } from "@/lib/api";

interface SharePostDialogProps {
  postId: number;
  currentUserId: number;
  postData: PostResponse;
  variant?: "ghost" | "default" | "outline";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  return `http://localhost:8080${url}`;
};

export function SharePostDialog({
  postId,
  currentUserId,
  postData,
  variant = "ghost",
  size = "sm",
  className = "",
}: SharePostDialogProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Generate post URL once
  const postUrl = `${window.location.origin}/post/${postId}`;

  const fetchConnections = useCallback(async () => {
    try {
      const conns = await getAcceptedConnections(currentUserId);
      setConnections(conns);
      setFilteredConnections(conns);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      toast.error("Failed to load connections");
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isShareDialogOpen) {
      fetchConnections();
    }
  }, [isShareDialogOpen, fetchConnections]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConnections(connections);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredConnections(
        connections.filter((conn) => {
          const otherUser = conn.requester.id === currentUserId ? conn.receiver : conn.requester;
          return otherUser.name.toLowerCase().includes(query);
        })
      );
    }
  }, [searchQuery, connections, currentUserId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleSendInMessage = async () => {
    if (!selectedConnection) {
      toast.error("Please select a connection");
      return;
    }

    setIsSending(true);
    try {
      const otherUser = selectedConnection.requester.id === currentUserId 
        ? selectedConnection.receiver 
        : selectedConnection.requester;

      // Format the post content like an embedded post
      const postAuthor = postData.user.name;
      const postContent = postData.content;
      const postLikes = postData.likesCount;
      const postComments = postData.commentsCount;
      const postImage = postData.imageUrl;
      
      // Create a rich message with post details
      let richMessage = `📤 Shared a post by ${postAuthor}\n`;
      richMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      richMessage += `${postContent}\n\n`;
      
      // Include the actual image URL so it can be rendered
      if (postImage) {
        richMessage += `[SHARED_POST_IMAGE]${postImage}[/SHARED_POST_IMAGE]\n\n`;
      }
      
      richMessage += `❤️ ${postLikes} ${postLikes === 1 ? 'like' : 'likes'} • `;
      richMessage += `💬 ${postComments} ${postComments === 1 ? 'comment' : 'comments'}\n\n`;
      richMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
      richMessage += `🔗 View full post: ${postUrl}`;

      await sendMessage({
        senderId: currentUserId,
        receiverId: otherUser.id,
        content: richMessage,
      });

      toast.success(`Shared with ${otherUser.name}`);
      setIsShareDialogOpen(false);
      setSelectedConnection(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`gap-2 text-muted-foreground hover:bg-muted transition-all active:scale-95 ${className}`}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-medium">Share</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsShareDialogOpen(true)} 
            className="cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send in Message
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Share to Connection</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a connection to share this post with
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-border rounded-md p-2">
              {filteredConnections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {connections.length === 0 ? "No connections found" : "No matching connections"}
                </div>
              ) : (
                filteredConnections.map((conn) => {
                  const otherUser = conn.requester.id === currentUserId ? conn.receiver : conn.requester;
                  const isSelected = selectedConnection?.id === conn.id;
                  
                  return (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-primary/10 border-2 border-primary" 
                          : "hover:bg-muted border-2 border-transparent"
                      }`}
                    >
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={getImageUrl(otherUser.profileImageUrl)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {otherUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {otherUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {otherUser.profession}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsShareDialogOpen(false);
                  setSelectedConnection(null);
                  setSearchQuery("");
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInMessage}
                disabled={!selectedConnection || isSending}
              >
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
