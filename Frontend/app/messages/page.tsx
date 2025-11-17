"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    LoginResponse,
    getChatUsers,
    getMessageHistory,
    sendMessage,
    markMessagesAsRead,
    ChatUserResponse,
    MessageResponse,
} from "@/lib/api";
import toast from "react-hot-toast";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useUnreadMessages } from "@/lib/UnreadMessagesContext";

interface CurrentUser {
    id: number;
    name: string;
    avatar: string;
    community: string;
    unreadMessages?: number;
}

export default function MessagesPage() {
    const router = useRouter();
    const { unreadCount, decrementUnreadCount } = useUnreadMessages();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [chatUsers, setChatUsers] = useState<ChatUserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUserResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const selectedUserRef = useRef<ChatUserResponse | null>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update ref when selectedUser changes
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // Update currentUser when global unreadCount changes
    useEffect(() => {
        setCurrentUser((prev) => prev ? { ...prev, unreadMessages: unreadCount } : null);
    }, [unreadCount]);

    // Initialize user and load data
    useEffect(() => {
        let cleanupFn: (() => void) | undefined;

        const init = async () => {
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
                    unreadMessages: unreadCount,
                });

                loadChatUsers(user.id);
                cleanupFn = setupWebSocket(user.id);
            } catch (error) {
                console.error("Failed to parse user data:", error);
                sessionStorage.removeItem("user");
                toast.error("Session invalid. Please log in again.");
                router.push("/login");
            }
        };

        init();

        return () => {
            if (cleanupFn) cleanupFn();
        };
    }, [router]);

    // Load chat users (connections)
    const loadChatUsers = async (userId: number) => {
        try {
            const users = await getChatUsers(userId);
            setChatUsers(users);
        } catch (error) {
            console.error("Failed to load chat users:", error);
            toast.error("Failed to load chat users");
        } finally {
            setLoading(false);
        }
    };

    // Setup WebSocket connection
    const setupWebSocket = (userId: number) => {
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket as any,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
            console.log("WebSocket connected");

            // Subscribe to personal message queue
            stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
                const receivedMessage: MessageResponse = JSON.parse(message.body);
                console.log("Received message:", receivedMessage);

                // Check if this is a message the user is receiving (not sending)
                const isReceivingMessage = receivedMessage.receiverId === userId;

                // Use ref to get current selectedUser value
                const currentSelectedUser = selectedUserRef.current;

                // Update messages if the chat is currently open
                if (
                    currentSelectedUser &&
                    (receivedMessage.senderId === currentSelectedUser.id ||
                        receivedMessage.receiverId === currentSelectedUser.id)
                ) {
                    setMessages((prev) => [...prev, receivedMessage]);
                    
                    // If the chat is open and we're receiving a message, don't increment unread count
                    // The global context will handle this, but we should decrement since we're reading it live
                    if (isReceivingMessage) {
                        // Decrement immediately since we're viewing the message
                        decrementUnreadCount(1);
                    }
                }
                // Note: If chat is not open, the global WebSocket context will increment the unread count

                // Update chat users list to reflect new message and sort by most recent
                setChatUsers((prev) => {
                    const updatedUsers = prev.map((user) => {
                        if (user.id === receivedMessage.senderId) {
                            // Only increment unread count if this chat is not currently open
                            const shouldIncrementUnread = !currentSelectedUser || currentSelectedUser.id !== user.id;
                            return {
                                ...user,
                                lastMessage: receivedMessage.content,
                                unreadCount: shouldIncrementUnread ? user.unreadCount + 1 : user.unreadCount,
                                lastMessageTime: new Date(receivedMessage.timestamp).getTime(),
                            };
                        }
                        return user;
                    });
                    
                    // Sort by most recent message (users with recent messages at top)
                    return updatedUsers.sort((a, b) => {
                        const timeA = (a as any).lastMessageTime || 0;
                        const timeB = (b as any).lastMessageTime || 0;
                        return timeB - timeA;
                    });
                });
            });
        };

        stompClient.onStompError = (frame) => {
            console.error("WebSocket error:", frame);
        };

        stompClient.activate();
        stompClientRef.current = stompClient;

        // Cleanup on unmount
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    };

    // Load message history when selecting a user
    const handleSelectUser = async (user: ChatUserResponse) => {
        setSelectedUser(user);
        
        if (!currentUser) return;

        try {
            const history = await getMessageHistory(currentUser.id, user.id);
            setMessages(history);

            // Get the unread count for this user before marking as read
            const unreadForThisUser = user.unreadCount;

            // Mark messages as read
            await markMessagesAsRead(currentUser.id, user.id);

            // Update unread count in chat users list
            setChatUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, unreadCount: 0 } : u))
            );

            // Decrement total unread count using global context
            if (unreadForThisUser > 0) {
                decrementUnreadCount(unreadForThisUser);
            }
        } catch (error) {
            console.error("Failed to load message history:", error);
            toast.error("Failed to load messages");
        }
    };

    // Send a message
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedUser || !currentUser) {
            return;
        }

        const messageRequest = {
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            content: messageText.trim(),
        };

        try {
            const sentMessage = await sendMessage(messageRequest);
            setMessages((prev) => [...prev, sentMessage]);
            setMessageText("");

            // Update last message in chat users and move to top
            setChatUsers((prev) => {
                const updatedUsers = prev.map((user) =>
                    user.id === selectedUser.id
                        ? { ...user, lastMessage: sentMessage.content, lastMessageTime: new Date(sentMessage.timestamp).getTime() }
                        : user
                );
                
                // Sort by most recent message
                return updatedUsers.sort((a, b) => {
                    const timeA = (a as any).lastMessageTime || 0;
                    const timeB = (b as any).lastMessageTime || 0;
                    return timeB - timeA;
                });
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        }
    };

    // Filter chat users based on search
    const filteredChatUsers = chatUsers.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header user={currentUser} />

            <div className="container mx-auto h-[calc(100vh-80px)] py-4">
                <Card className="h-full border-2 border-border/50 shadow-xl rounded-3xl overflow-hidden">
                    <div className="flex h-full">
                        {/* Left Sidebar - Chat Users List */}
                        <div className="w-full md:w-1/3 border-r border-border/50 flex flex-col">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-border/50">
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

                            {/* Chat Users List */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        Loading conversations...
                                    </div>
                                ) : filteredChatUsers.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        {searchQuery
                                            ? "No conversations found"
                                            : "No connections to chat with. Connect with people first!"}
                                    </div>
                                ) : (
                                    filteredChatUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleSelectUser(user)}
                                            className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                                                selectedUser?.id === user.id ? "bg-muted" : ""
                                            }`}
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage
                                                    src={user.profileImageUrl || "/placeholder.svg"}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback>
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold truncate">{user.name}</h4>
                                                    {user.unreadCount > 0 && (
                                                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {user.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.lastMessage || "No messages yet"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Side - Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedUser ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center space-x-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage
                                                src={selectedUser.profileImageUrl || "/placeholder.svg"}
                                                alt={selectedUser.name}
                                            />
                                            <AvatarFallback>
                                                {selectedUser.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{selectedUser.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedUser.profession}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center text-muted-foreground py-8">
                                                No messages yet. Start the conversation!
                                            </div>
                                        ) : (
                                            messages.map((message) => {
                                                const isOwnMessage = message.senderId === currentUser.id;
                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${
                                                            isOwnMessage ? "justify-end" : "justify-start"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                                isOwnMessage
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-muted text-foreground"
                                                            }`}
                                                        >
                                                            <p className="text-sm">{message.content}</p>
                                                            <p
                                                                className={`text-xs mt-1 ${
                                                                    isOwnMessage
                                                                        ? "text-primary-foreground/70"
                                                                        : "text-muted-foreground"
                                                                }`}
                                                            >
                                                                {new Date(message.timestamp).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-border/50">
                                        <div className="flex space-x-2">
                                            <Textarea
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                placeholder="Type a message..."
                                                className="min-h-[50px] max-h-[150px] resize-none"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            />
                                            <Button
                                                onClick={handleSendMessage}
                                                disabled={!messageText.trim()}
                                                className="h-[50px] w-[50px]"
                                            >
                                                <Send className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <h3 className="text-xl font-semibold mb-2">Welcome to Messages</h3>
                                        <p>Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
