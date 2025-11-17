"use client";

import { Header } from "@/components/header";
import { useUnreadMessages } from "@/lib/UnreadMessagesContext";
import { useState, useEffect } from "react";

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    user?: {
        id?: number;
        name: string;
        community: string;
        avatar: string;
        pendingRequests?: number;
    };
}

export function AuthenticatedLayout({ children, user }: AuthenticatedLayoutProps) {
    const { unreadCount } = useUnreadMessages();
    const [userWithUnread, setUserWithUnread] = useState(user);

    useEffect(() => {
        if (user) {
            setUserWithUnread({
                ...user,
                unreadMessages: unreadCount,
            });
        }
    }, [user, unreadCount]);

    return (
        <>
            <Header user={userWithUnread} />
            {children}
        </>
    );
}
