"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Users,
    Bell,
    Home,
    MessageCircle,
    User,
    LogOut,
    Moon,
    Sun,
    ChevronDown,
    Briefcase,
    BookOpen,
    Music,
    Stethoscope,
    Zap,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils" // Ensure you have this utility, or use standard template literals

interface HeaderProps {
    user?: {
        id?: number
        name: string
        community: string
        avatar: string
        pendingRequests?: number
        unreadMessageCount?: number
        unreadNotificationCount?: number
    }
}

// Community Icon Mapping
const communityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    student: BookOpen,
    teacher: Users,
    musician: Music,
    doctor: Stethoscope,
    dancer: Zap,
}

// Community Color Mapping
const communityColors: Record<string, string> = {
    student: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    teacher: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30",
    musician: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
    doctor: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    dancer: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
}

export function Header({ user }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const pathname = usePathname() // To track active page
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch for theme icons
    useEffect(() => {
        setMounted(true)
    }, [])

    const communityKey = user?.community.toLowerCase() || "";
    const CommunityIcon = communityIcons[communityKey] || Briefcase;
    const communityColorClass = communityColors[communityKey] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    const handleSignOut = () => {
        sessionStorage.removeItem('user');
        router.push('/');
    };

    // Define Navigation Items dynamically
    const navItems = user ? [
        {
            name: "My Community", // Renamed from Dashboard
            href: "/my-community",
            icon: Home
        },
        {
            name: "Jobs",
            href: "/jobs",
            icon: Briefcase
        },
        {
            name: "Messages",
            href: "/messages",
            icon: MessageCircle,
            badge: user.unreadMessageCount
        },
        {
            name: "Notifications",
            href: "/notification",
            icon: Bell,
            badge: user.unreadNotificationCount
        }
    ] : [];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Left Side: Logo & Nav */}
                <div className="flex items-center gap-6 lg:gap-8">
                    {/* Logo */}
                    <Link href={user ? "/home" : "/"} className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="hidden sm:inline text-xl font-bold tracking-tight text-gradient">
                            ConnectHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href}
                                        className={cn(
                                            "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out",
                                            isActive 
                                                ? "bg-primary/10 text-primary shadow-sm" 
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4", isActive && "fill-current")} />
                                        <span className="hidden lg:inline">{item.name}</span>
                                        
                                        {/* Notification Badge */}
                                        {item.badge && item.badge > 0 ? (
                                            <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-[10px] font-bold text-white shadow-sm">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        ) : null}

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    )}
                </div>

                {/* Right Side: Controls & Profile */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                        {mounted ? (
                            theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
                        ) : (
                            <span className="h-4 w-4 block" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {user ? (
                        <div className="flex items-center gap-3 pl-3 ml-2 border-l border-border/40">
                            {/* Community Badge */}
                            <Badge variant="outline" className={`${communityColorClass} border font-medium hidden sm:flex items-center gap-1.5 py-1.5 px-3 capitalize rounded-lg shadow-sm`}>
                                <CommunityIcon className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">{user.community}</span>
                            </Badge>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 pl-1.5 pr-3 h-auto rounded-full hover:bg-accent transition-all">
                                        <Avatar className="w-9 h-9 border-2 border-primary/20 shadow-sm">
                                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden sm:flex flex-col items-start text-left">
                                            <span className="text-sm font-semibold leading-none">{user.name}</span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 shadow-lg">
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1.5">
                                            <p className="text-sm font-semibold leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground capitalize flex items-center gap-1.5">
                                                <CommunityIcon className="w-3 h-3" />
                                                {user.community} Account
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent rounded-md">
                                        <Link href="/profile" className="flex items-center gap-2.5 p-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium">My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-md p-2.5" onClick={handleSignOut}>
                                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-2.5">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        // Logged Out State
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-lg">
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild className="font-semibold shadow-sm rounded-lg bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:scale-105 transition-all">
                                <Link href="/signup">Join Now</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}