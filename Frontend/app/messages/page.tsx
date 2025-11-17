"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";

// Icons
import { Send, Search, Circle } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/header";

// API
import {
    getConversations,
    getConversation,
    sendMessage,
    markMessagesAsRead,
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

export default function MessagesPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize user and load conversations
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
        } catch (error) {
            sessionStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);

    // Setup WebSocket connection
    useEffect(() => {
        if (!currentUser?.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            debug: (str) => {
                console.log("STOMP: " + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("WebSocket Connected");

            // Subscribe to personal message queue
            client.subscribe(`/queue/messages/${currentUser.id}`, (message) => {
                const newMessage: MessageResponse = JSON.parse(message.body);
                
                // Update messages if conversation is selected
                if (selectedConversation && 
                    (newMessage.senderId === selectedConversation.userId || 
                     newMessage.receiverId === selectedConversation.userId)) {
                    setMessages((prev) => [...prev, newMessage]);
                    
                    // Mark as read if sender is the selected conversation
                    if (newMessage.senderId === selectedConversation.userId) {
                        markMessagesAsRead(currentUser.id!, selectedConversation.userId);
                    }
                }
                
                // Reload conversations to update last message and order
                loadConversations(currentUser.id!);
            });

            // Subscribe to read receipts
            client.subscribe(`/queue/read/${currentUser.id}`, () => {
                // Reload conversations to update unread counts
                loadConversations(currentUser.id!);
            });
        };

        client.onStompError = (frame) => {
            console.error("Broker error: " + frame.headers["message"]);
            console.error("Details: " + frame.body);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [currentUser?.id]);

    const loadConversations = async (userId: number) => {
        try {
            const convos = await getConversations(userId);
            setConversations(convos);
            
            // Calculate total unread count
            const totalUnread = convos.reduce((sum, c) => sum + c.unreadCount, 0);
            setUnreadCount(totalUnread);
        } catch (error) {
            console.error("Failed to load conversations:", error);
            toast.error("Unable to load conversations. Please make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async (conversation: ConversationResponse) => {
        if (!currentUser?.id) return;
        
        setSelectedConversation(conversation);
        
        try {
            const msgs = await getConversation(currentUser.id, conversation.userId);
            setMessages(msgs);
            
            // Mark messages as read
            await markMessagesAsRead(currentUser.id, conversation.userId);
            
            // Reload conversations to update unread counts
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

            // Send via REST API (which also sends via WebSocket)
            await sendMessage(messageRequest);
            
            setMessageInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
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
        
        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return "Yesterday";
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header user={{ ...currentUser, unreadMessageCount: unreadCount }} />

            <div className="container mx-auto px-4 py-6 h-[calc(100vh-5rem)]">
                <div className="flex h-full gap-4">
                    {/* Left Panel - Conversations List */}
                    <div className="w-full md:w-80 lg:w-96 bg-card border border-border rounded-lg flex flex-col">
                        {/* Search Header */}
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

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="font-medium">No conversations available</p>
                                    <p className="text-sm mt-2">
                                        {conversations.length === 0 
                                            ? "Connect with other users to start messaging!"
                                            : "No matches found for your search."}
                                    </p>
                                    {conversations.length === 0 && (
                                        <p className="text-xs mt-2 text-muted-foreground/70">
                                            Go to Dashboard to connect with users in your community.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredConversations.map((conversation) => (
                                        <div
                                            key={conversation.userId}
                                            onClick={() => loadConversation(conversation)}
                                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                                                selectedConversation?.userId === conversation.userId
                                                    ? "bg-muted"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage
                                                            src={getImageUrl(conversation.userProfileImageUrl)}
                                                        />
                                                        <AvatarFallback>
                                                            {conversation.userName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {conversation.isOnline && (
                                                        <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <h3 className="font-semibold text-sm truncate">
                                                            {conversation.userName}
                                                        </h3>
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
                                {/* Chat Header */}
                                <div className="p-4 border-b border-border flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage
                                            src={getImageUrl(selectedConversation.userProfileImageUrl)}
                                        />
                                        <AvatarFallback>
                                            {selectedConversation.userName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold">{selectedConversation.userName}</h2>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedConversation.isOnline ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const isSent = message.senderId === currentUser.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                            isSent
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted"
                                                        }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap break-words">
                                                            {message.content}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-1 ${
                                                                isSent
                                                                    ? "text-primary-foreground/70"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        >
                                                            {formatMessageTime(message.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-border">
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Type a message..."
                                            className="resize-none min-h-[44px] max-h-[120px]"
                                            rows={1}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim()}
                                            size="icon"
                                            className="h-11 w-11 shrink-0"
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
                                    <p className="text-sm mt-2">Choose a contact to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
