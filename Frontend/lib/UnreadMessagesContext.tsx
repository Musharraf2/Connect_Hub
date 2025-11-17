"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUnreadMessageCount } from "@/lib/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface UnreadMessagesContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    decrementUnreadCount: (amount: number) => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState<number | null>(null);

    // Fetch unread count from server
    const refreshUnreadCount = useCallback(async () => {
        if (!userId) return;
        
        try {
            const count = await getUnreadMessageCount(userId);
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch unread message count:", error);
        }
    }, [userId]);

    // Setup WebSocket connection for real-time updates
    useEffect(() => {
        // Get user ID from session storage
        const userDataString = sessionStorage.getItem("user");
        if (!userDataString) return;

        try {
            const user = JSON.parse(userDataString);
            setUserId(user.id);
            
            // Initial fetch
            getUnreadMessageCount(user.id).then(setUnreadCount).catch(console.error);

            // Setup WebSocket for real-time updates
            const socket = new SockJS("http://localhost:8080/ws");
            const stompClient = new Client({
                webSocketFactory: () => socket as any,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            stompClient.onConnect = () => {
                console.log("UnreadMessages WebSocket connected");

                // Subscribe to personal message queue
                stompClient.subscribe(`/user/${user.id}/queue/messages`, (message) => {
                    console.log("New message received, updating unread count");
                    // Increment unread count when new message arrives
                    setUnreadCount((prev) => prev + 1);
                });
            };

            stompClient.onStompError = (frame) => {
                console.error("UnreadMessages WebSocket error:", frame);
            };

            stompClient.activate();

            // Cleanup
            return () => {
                if (stompClient) {
                    stompClient.deactivate();
                }
            };
        } catch (error) {
            console.error("Failed to setup unread messages tracking:", error);
        }
    }, []);

    const decrementUnreadCount = useCallback((amount: number) => {
        setUnreadCount((prev) => Math.max(0, prev - amount));
    }, []);

    return (
        <UnreadMessagesContext.Provider value={{ unreadCount, refreshUnreadCount, decrementUnreadCount }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
}

export function useUnreadMessages() {
    const context = useContext(UnreadMessagesContext);
    if (context === undefined) {
        throw new Error("useUnreadMessages must be used within an UnreadMessagesProvider");
    }
    return context;
}
