"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, UserPlus, Trash2, CheckCheck, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { Header } from "@/components/header";
import { getUnreadMessageCount } from "@/lib/api";

// API Types
interface NotificationDTO {
    id: number;
    type: "LIKE" | "COMMENT" | "CONNECTION_ACCEPTED" | "CONNECTION_REQUEST";
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedEntityId?: number;
    actor: {
        id: number;
        name: string;
        profileImageUrl?: string;
    };
}

interface LoginResponse {
    id: number;
    name: string;
    email: string;
    profession: string;
}

interface CurrentUser {
    id: number;
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
    unreadMessageCount?: number;
}

// API Functions (inline to avoid import issues)
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api";

const getNotifications = async (userId: number): Promise<NotificationDTO[]> => {
    const res = await fetch(`${BASE}/notifications/${userId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
};

const markNotificationAsRead = async (notificationId: number): Promise<NotificationDTO> => {
    const res = await fetch(`${BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error("Failed to mark as read");
    return res.json();
};

const markAllNotificationsAsRead = async (userId: number): Promise<string> => {
    const res = await fetch(`${BASE}/notifications/${userId}/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error("Failed to mark all as read");
    const data = await res.json();
    return data.message;
};

const deleteNotification = async (notificationId: number): Promise<string> => {
    const res = await fetch(`${BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error("Failed to delete notification");
    const data = await res.json();
    return data.message;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const router = useRouter();

    useEffect(() => {
        console.log("NotificationsPage mounted");
        
        const userDataString = sessionStorage.getItem("user");
        console.log("User data from session:", userDataString);
        
        if (!userDataString) {
            console.error("No user data in session");
            toast.error("Please log in.");
            router.push("/login");
            return;
        }

        try {
            const user: LoginResponse = JSON.parse(userDataString);
            console.log("Parsed user:", user);
            
            setCurrentUser({
                id: user.id,
                name: user.name,
                community: user.profession,
                avatar: "/placeholder.svg",
                pendingRequests: 0,
                unreadMessageCount: 0,
            });

            fetchNotifications(user.id);
            fetchUnreadCount(user.id);
        } catch (error) {
            console.error("Failed to parse user data:", error);
            sessionStorage.removeItem("user");
            toast.error("Session invalid. Please log in again.");
            router.push("/login");
        }
    }, [router]);

    const fetchNotifications = async (userId: number) => {
        console.log("Fetching notifications for user:", userId);
        setLoading(true);
        setError(null);
        
        try {
            const data = await getNotifications(userId);
            console.log("Notifications received:", data);
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to load notifications";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async (userId: number) => {
        try {
            const count = await getUnreadMessageCount(userId);
            setCurrentUser((prev) => (prev ? { ...prev, unreadMessageCount: count } : null));
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
            toast.error("Failed to update notification");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;

        try {
            await markAllNotificationsAsRead(currentUser.id);
            setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all as read:", error);
            toast.error("Failed to update notifications");
        }
    };

    const handleDeleteNotification = async (notificationId: number) => {
        try {
            await deleteNotification(notificationId);
            setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    const getNotificationIcon = (type: NotificationDTO["type"]) => {
        switch (type) {
            case "LIKE":
                return <Heart className="w-5 h-5 text-red-500" />;
            case "COMMENT":
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case "CONNECTION_ACCEPTED":
                return <CheckCheck className="w-5 h-5 text-green-500" />;
            case "CONNECTION_REQUEST":
                return <UserPlus className="w-5 h-5 text-purple-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification: NotificationDTO) => {
        handleMarkAsRead(notification.id);
        
        if (notification.type === "CONNECTION_REQUEST" || notification.type === "CONNECTION_ACCEPTED") {
            router.push("/connections");
        } else if (notification.relatedEntityId) {
            router.push("/home");
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto max-w-3xl py-8 px-4">
                    <Card className="border-2 border-red-500">
                        <CardContent className="py-12 text-center">
                            <p className="text-red-500 font-semibold mb-2">Error Loading Notifications</p>
                            <p className="text-sm text-muted-foreground mb-4">{error}</p>
                            <Button onClick={() => currentUser && fetchNotifications(currentUser.id)}>
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header user={currentUser} />

            <main className="container mx-auto max-w-3xl py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <Card className="border-2 border-border/50">
                            <CardContent className="py-12 text-center">
                                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">No notifications yet</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    When someone interacts with your posts or sends you a connection request,
                                    you'll see it here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                    notification.isRead
                                        ? "border-border/50 bg-card"
                                        : "border-primary/30 bg-primary/5"
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage
                                                src={notification.actor.profileImageUrl || "/placeholder.svg"}
                                                alt={notification.actor.name}
                                            />
                                            <AvatarFallback>
                                                {notification.actor.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    {getNotificationIcon(notification.type)}
                                                    <p className="text-sm">
                                                        <span className="font-semibold">
                                                            {notification.actor.name}
                                                        </span>{" "}
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notification.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                                {!notification.isRead && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}