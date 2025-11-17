"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
    LoginResponse,
    ConversationSummary,
    MessageResponse,
    getConversationList,
    getConversation,
    sendMessage as sendMessageAPI,
    markMessagesAsRead,
} from "@/lib/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface CurrentUser {
    id?: number;
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}

export default function MessagesPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [selectedUser, setSelectedUser] = useState<ConversationSummary | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize user and load data
    useEffect(() => {
        const userDataString = sessionStorage.getItem("user");

        if (!userDataString) {
            toast.error("Please log in.");
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
            console.error("Failed to parse user data:", error);
            sessionStorage.removeItem("user");
            toast.error("Session invalid. Please log in again.");
            router.push("/login");
        }
    }, [router]);

    // Setup WebSocket connection
    useEffect(() => {
        if (!currentUser?.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log("WebSocket connected");
                
                // Subscribe to personal message queue
                client.subscribe(`/queue/messages/${currentUser.id}`, (message) => {
                    const receivedMessage: MessageResponse = JSON.parse(message.body);
                    
                    // Update messages if the conversation is currently selected
                    if (selectedUser && 
                        (receivedMessage.sender.id === selectedUser.user.id || 
                         receivedMessage.receiver.id === selectedUser.user.id)) {
                        setMessages(prev => [...prev, receivedMessage]);
                        
                        // Mark as read if sender is the selected user
                        if (receivedMessage.sender.id === selectedUser.user.id) {
                            markMessagesAsRead(currentUser.id!, selectedUser.user.id);
                        }
                    }
                    
                    // Refresh conversation list
                    loadConversations(currentUser.id!);
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [currentUser?.id, selectedUser]);

    const loadConversations = async (userId: number) => {
        try {
            const convos = await getConversationList(userId);
            setConversations(convos);
        } catch (error) {
            console.error("Failed to load conversations:", error);
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const selectConversation = async (conversation: ConversationSummary) => {
        setSelectedUser(conversation);
        
        if (!currentUser?.id) return;
        
        try {
            const msgs = await getConversation(currentUser.id, conversation.user.id);
            setMessages(msgs);
            
            // Mark messages as read
            if (conversation.unreadCount > 0) {
                await markMessagesAsRead(currentUser.id, conversation.user.id);
                // Refresh conversation list to update unread count
                loadConversations(currentUser.id);
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
            toast.error("Failed to load messages");
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !currentUser?.id || !selectedUser) return;

        const messageRequest = {
            senderId: currentUser.id,
            receiverId: selectedUser.user.id,
            content: messageInput.trim(),
        };

        try {
            const sentMessage = await sendMessageAPI(messageRequest);
            setMessages(prev => [...prev, sentMessage]);
            setMessageInput("");
            
            // Refresh conversation list to update last message
            loadConversations(currentUser.id);
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

    const filteredConversations = conversations.filter(conv =>
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading || !currentUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header user={currentUser} />

            <div className="container mx-auto py-4 h-[calc(100vh-88px)]">
                <Card className="h-full flex overflow-hidden border-2 border-border/50 shadow-xl">
                    {/* Left Sidebar - Conversations List */}
                    <div className="w-full md:w-96 border-r border-border flex flex-col">
                        {/* Search Bar */}
                        <div className="p-4 border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <ScrollArea className="flex-1">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p>No conversations yet.</p>
                                    <p className="text-sm mt-2">Connect with people to start messaging!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredConversations.map((conv) => (
                                        <button
                                            key={conv.user.id}
                                            onClick={() => selectConversation(conv)}
                                            className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                                                selectedUser?.user.id === conv.user.id ? "bg-muted" : ""
                                            }`}
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage
                                                    src={conv.user.profileImageUrl || "/placeholder.svg"}
                                                    alt={conv.user.name}
                                                />
                                                <AvatarFallback>
                                                    {conv.user.name.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 text-left overflow-hidden">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold truncate">{conv.user.name}</h3>
                                                    {conv.lastMessageTime && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground truncate flex-1">
                                                        {conv.lastMessage || "No messages yet"}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedUser ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage
                                            src={selectedUser.user.profileImageUrl || "/placeholder.svg"}
                                            alt={selectedUser.user.name}
                                        />
                                        <AvatarFallback>
                                            {selectedUser.user.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold">{selectedUser.user.name}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedUser.user.profession}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {messages.map((msg) => {
                                            const isOwnMessage = msg.sender.id === currentUser?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                            isOwnMessage
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted"
                                                        }`}
                                                    >
                                                        <p className="break-words">{msg.content}</p>
                                                        <p
                                                            className={`text-xs mt-1 ${
                                                                isOwnMessage
                                                                    ? "text-primary-foreground/70"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        >
                                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Message Input */}
                                <div className="p-4 border-t border-border">
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleSendMessage} size="icon">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <p className="text-lg font-medium">Select a conversation</p>
                                    <p className="text-sm mt-2">Choose a contact to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
