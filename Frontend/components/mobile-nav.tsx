"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, MessageSquare, Bell, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const pathname = usePathname()
    const [user, setUser] = useState<{
        id?: number
        unreadMessageCount?: number
        unreadNotificationCount?: number
    } | null>(null)

    // Load user data from sessionStorage (similar to header.tsx pattern)
    useEffect(() => {
        const userDataString = sessionStorage.getItem('user')
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                setUser(userData)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    // Navigation items
    const navItems = [
        {
            name: "Community",
            href: "/my-community",
            icon: Users,
            badge: 0
        },
        {
            name: "Jobs",
            href: "/jobs",
            icon: Briefcase,
            badge: 0
        },
        {
            name: "Messages",
            href: "/messages",
            icon: MessageSquare,
            badge: user?.unreadMessageCount || 0
        },
        {
            name: "Notifications",
            href: "/notification",
            icon: Bell,
            badge: user?.unreadNotificationCount || 0
        }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/40 bg-background/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="relative">
                                <item.icon className={cn(
                                    "w-5 h-5",
                                    isActive && "fill-current"
                                )} />
                                
                                {/* Notification Badge */}
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-[9px] font-bold text-white">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                            
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive && "font-semibold"
                            )}>
                                {item.name}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-primary" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
