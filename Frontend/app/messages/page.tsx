"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";

// Icons
import { Send, Search, Trash2, Check, CheckCheck, Smile, Paperclip, Loader2 } from "lucide-react";

// Emoji Picker
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/header";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// API
import {
    getConversations,
    getConversation,
    sendMessage,
    markMessagesAsRead,
    deleteMessage,
    uploadMessageImage,
    ConversationResponse,
    MessageResponse,
    LoginResponse,
} from "@/lib/api";

interface CurrentUser {
    id?: number;
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}

const getImageUrl = (url: string | null | undefined) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
};

// Helper function to parse message content and extract image URLs
const parseMessageContent = (content: string): { text: string; imageUrl: string | null } => {
    // Check for [IMAGE]url[/IMAGE] pattern
    const imageRegex = /\[IMAGE\](.*?)\[\/IMAGE\]/;
    const imageMatch = content.match(imageRegex);
    
    if (imageMatch) {
        const imageUrl = imageMatch[1];
        const text = content.replace(imageRegex, '').trim();
        return { text, imageUrl };
    }
    
    // Also check for old pattern [SHARED_POST_IMAGE]
    const sharedImageRegex = /\[SHARED_POST_IMAGE\](.*?)\[\/SHARED_POST_IMAGE\]/;
    const sharedMatch = content.match(sharedImageRegex);
    
    if (sharedMatch) {
        const imageUrl = sharedMatch[1];
        const text = content.replace(sharedImageRegex, '').trim();
        return { text, imageUrl };
    }
    
    return { text: content, imageUrl: null };
};

export default function MessagesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedConversationRef = useRef<ConversationResponse | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Image Upload State
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Online Users State
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Fetch Online Status API
    const fetchOnlineStatus = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/users/online-status");
            if (response.ok) {
                const data = await response.json();
                setOnlineUsers(new Set(data));
            }
        } catch (error) {
            console.error("Failed to fetch online status", error);
        }
    };

    // Initialize User & Polling
    useEffect(() => {
        const userDataString = sessionStorage.getItem("user");
        if (!userDataString) {
            router.push("/login");
            return;
        }

        try {
            const user: LoginResponse = JSON.parse(userDataString);
            setCurrentUser({
                id: user.id,
                name: user.name,
                community: user.profession,
                avatar: "/placeholder.svg",
                pendingRequests: 0,
            });

            loadConversations(user.id);
            
            // 1. Initial Fetch
            fetchOnlineStatus();

            // 2. Poll every 5 seconds (Backup mechanism)
            const interval = setInterval(fetchOnlineStatus, 5000);
            return () => clearInterval(interval);

        } catch (error) {
            sessionStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);

    // Setup WebSocket
    useEffect(() => {
        if (!currentUser?.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8080/ws?userId=${currentUser.id}`),
            debug: (str) => {
                // console.log("STOMP: " + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("WebSocket Connected");

            // 1. Listen for Incoming Messages
            client.subscribe(`/queue/messages/${currentUser.id}`, (message) => {
                const newMessage: MessageResponse = JSON.parse(message.body);
                
                const currentConversation = selectedConversationRef.current;
                if (currentConversation && 
                    (newMessage.senderId === currentConversation.userId || 
                     newMessage.receiverId === currentConversation.userId)) {
                    
                    setMessages((prev) => [...prev, newMessage]);
                    
                    // Mark as read immediately if chat is open
                    if (newMessage.senderId === currentConversation.userId) {
                        markMessagesAsRead(currentUser.id!, currentConversation.userId);
                    }
                }
                
                loadConversations(currentUser.id!);
            });

            // 2. Listen for Read Receipts (Blue Ticks)
            client.subscribe(`/queue/read/${currentUser.id}`, (message) => {
                const body = JSON.parse(message.body);
                const readerId = typeof body === 'number' ? body : body.readerId;
                
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.senderId === currentUser.id && msg.receiverId === readerId
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );
                loadConversations(currentUser.id!);
            });

            // 3. Listen for Deletions
            client.subscribe(`/queue/delete/${currentUser.id}`, (message) => {
                const deletedMessageId = parseInt(message.body);
                setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessageId));
                loadConversations(currentUser.id!);
            });

            // 4. Listen for Online Status Updates
            client.subscribe(`/topic/online-status`, (message) => {
                try {
                    const body = JSON.parse(message.body);
                    let userId: number;
                    let status: string = 'ONLINE';

                    if (typeof body === 'object' && body !== null) {
                        userId = Number(body.userId);
                        status = body.status;
                    } else {
                        userId = Number(body);
                    }

                    setOnlineUsers(prev => {
                        const newSet = new Set(prev);
                        if (status === 'ONLINE') {
                            newSet.add(userId);
                        } else {
                            newSet.delete(userId);
                        }
                        return newSet;
                    });
                } catch (e) {
                    console.error("Error parsing online status", e);
                }
            });
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client.active) client.deactivate();
        };
    }, [currentUser?.id]);

    // Load Conversation Logic
    const loadConversations = async (userId: number) => {
        try {
            const convos = await getConversations(userId);
            setConversations(convos);
            const totalUnread = convos.reduce((sum, c) => sum + c.unreadCount, 0);
            setUnreadCount(totalUnread);
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async (conversation: ConversationResponse) => {
        if (!currentUser?.id) return;
        
        setSelectedConversation(conversation);
        selectedConversationRef.current = conversation;
        
        try {
            const msgs = await getConversation(currentUser.id, conversation.userId);
            setMessages(msgs);
            await markMessagesAsRead(currentUser.id, conversation.userId);
            loadConversations(currentUser.id);
        } catch (error) {
            console.error("Failed to load conversation:", error);
            toast.error("Failed to load messages");
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation || !currentUser?.id) return;

        try {
            const messageRequest = {
                senderId: currentUser.id,
                receiverId: selectedConversation.userId,
                content: messageInput.trim(),
            };
            await sendMessage(messageRequest);
            setMessageInput("");
            setShowEmojiPicker(false); // Close emoji picker when sending
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessageInput((prev) => prev + emojiData.emoji);
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation || !currentUser?.id) return;

        // Validate file is an image (both MIME type and extension)
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        // Safely extract file extension
        const lastDotIndex = file.name.lastIndexOf('.');
        const fileExtension = lastDotIndex !== -1 
            ? file.name.toLowerCase().substring(lastDotIndex) 
            : '';
        
        if (!validImageTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
            toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        setUploadingImage(true);
        try {
            // Upload image using API function
            const data = await uploadMessageImage(file);
            const imageUrl = data.imageUrl;

            // Send message with image URL in [IMAGE] format
            const messageRequest = {
                senderId: currentUser.id,
                receiverId: selectedConversation.userId,
                content: `[IMAGE]${imageUrl}[/IMAGE]`,
            };
            await sendMessage(messageRequest);
            
            toast.success('Image sent');
        } catch (error) {
            console.error('Image upload failed:', error instanceof Error ? error.message : 'Unknown error');
            toast.error('Failed to send image');
        } finally {
            setUploadingImage(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        setMessageToDelete(messageId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteMessage = async () => {
        if (!messageToDelete || !currentUser?.id) return;
        try {
            await deleteMessage(messageToDelete, currentUser.id);
            setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));
            if (selectedConversation) loadConversations(currentUser.id);
            setDeleteDialogOpen(false);
            setMessageToDelete(null);
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp: string | null) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (days === 1) return "Yesterday";
        if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatMessageTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading || !currentUser) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header user={{ ...currentUser, unreadMessageCount: unreadCount }} />

            <div className="container mx-auto px-4 py-6 h-[calc(100vh-5rem)]">
                <div className="flex h-full gap-4">
                    {/* Left Panel - Conversations */}
                    <div className="w-full md:w-80 lg:w-96 bg-card border border-border rounded-lg flex flex-col">
                        <div className="p-4 border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-muted border-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="font-medium">No conversations found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredConversations.map((conversation) => (
                                        <div
                                            key={conversation.userId}
                                            onClick={() => loadConversation(conversation)}
                                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                                                selectedConversation?.userId === conversation.userId ? "bg-muted" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src={getImageUrl(conversation.userProfileImageUrl)} />
                                                        <AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    {/* GREEN DOT INDICATOR */}
                                                    {onlineUsers.has(conversation.userId) && (
                                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full shadow-sm"></span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <h3 className="font-semibold text-sm truncate">{conversation.userName}</h3>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {formatTime(conversation.lastMessageTime)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {conversation.lastMessage || "No messages yet"}
                                                        </p>
                                                        {conversation.unreadCount > 0 && (
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ml-2">
                                                                {conversation.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Chat */}
                    <div className="flex-1 bg-card border border-border rounded-lg flex flex-col">
                        {selectedConversation ? (
                            <>
                                <div className="p-4 border-b border-border flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={getImageUrl(selectedConversation.userProfileImageUrl)} />
                                            <AvatarFallback>{selectedConversation.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {/* Header Green Dot */}
                                        {onlineUsers.has(selectedConversation.userId) && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full"></span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">{selectedConversation.userName}</h2>
                                        {/* Status Text */}
                                        <p className="text-xs text-muted-foreground">
                                            {onlineUsers.has(selectedConversation.userId) ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto bg-muted/20">
                                    <div className="space-y-3">
                                        {messages.map((message, index) => {
                                            const isSent = message.senderId === currentUser.id;
                                            const { text, imageUrl } = parseMessageContent(message.content);
                                            
                                            // Check if next message is from same sender for grouping
                                            const nextMessage = messages[index + 1];
                                            const isGrouped = nextMessage && nextMessage.senderId === message.senderId;
                                            
                                            return (
                                                <div key={message.id} className={`flex ${isSent ? "justify-end" : "justify-start"} group ${isGrouped ? 'mb-1' : 'mb-3'}`}>
                                                    <div className={`max-w-[70%] rounded-lg px-4 py-2 relative shadow-sm ${
                                                        isSent 
                                                            ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none" 
                                                            : "bg-muted/50 text-foreground rounded-tl-none"
                                                    }`}>
                                                        {isSent && (
                                                            <button onClick={() => handleDeleteMessage(message.id)} className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded">
                                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                            </button>
                                                        )}
                                                        {text && <p className="text-sm whitespace-pre-wrap break-words">{text}</p>}
                                                        {imageUrl && (
                                                            <div className={`${text ? 'mt-2' : ''} rounded-md overflow-hidden`}>
                                                                <img src={imageUrl} alt="Shared" className="w-full max-w-xs object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between mt-1 gap-2">
                                                            <p className={`text-xs ${isSent ? "text-white/70" : "text-muted-foreground"}`}>
                                                                {formatMessageTime(message.timestamp)}
                                                            </p>
                                                            {isSent && (
                                                                <div className="flex items-center">
                                                                    {message.isRead ? (
                                                                        <CheckCheck className="w-3 h-3 text-blue-200" />
                                                                    ) : (
                                                                        <Check className="w-3 h-3 text-white/50" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                <div className="p-4 border-t border-border bg-card">
                                    <div className="relative flex items-end gap-2 bg-muted/50 rounded-full px-4 py-2 shadow-sm border border-border/50">
                                        {/* Hidden file input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        
                                        {/* Image Upload Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleImageButtonClick}
                                            disabled={uploadingImage}
                                            className="h-9 w-9 shrink-0 rounded-full hover:bg-muted"
                                        >
                                            {uploadingImage ? (
                                                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                            ) : (
                                                <Paperclip className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </Button>

                                        {/* Message Input */}
                                        <Textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Type a message..."
                                            className="flex-1 resize-none min-h-[36px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 py-2 px-0"
                                            rows={1}
                                        />

                                        {/* Emoji Picker Button */}
                                        <div className="relative" ref={emojiPickerRef}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="h-9 w-9 shrink-0 rounded-full hover:bg-muted"
                                            >
                                                <Smile className="w-5 h-5 text-muted-foreground" />
                                            </Button>
                                            
                                            {/* Emoji Picker Popover */}
                                            {showEmojiPicker && (
                                                <div className="absolute bottom-12 right-0 z-50">
                                                    <EmojiPicker
                                                        onEmojiClick={handleEmojiClick}
                                                        autoFocusSearch={false}
                                                        width={320}
                                                        height={400}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Send Button */}
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim() || uploadingImage}
                                            size="icon"
                                            className="h-9 w-9 shrink-0 rounded-full"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center">
                                <div className="text-muted-foreground">
                                    <p className="text-lg font-medium">Select a conversation</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Delete Message?</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setMessageToDelete(null); }}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteMessage}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}