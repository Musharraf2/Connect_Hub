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
    Settings,
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
            href: "/dashboard",
            icon: Home
        },
        {
            name: "Messages",
            href: "/messages",
            icon: MessageCircle
        },
        {
            name: "Notifications",
            href: "/notification",
            icon: Bell,
            badge: user.pendingRequests
        }
    ] : [];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Left Side: Logo & Nav */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href={user ? "/home" : "/"} className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                            <Users className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
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
                                            "relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
                                            isActive 
                                                ? "bg-primary/10 text-primary" 
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4", isActive && "fill-current")} />
                                        <span>{item.name}</span>
                                        
                                        {/* Notification Dot */}
                                        {item.badge && item.badge > 0 ? (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm">
                                                {item.badge}
                                            </span>
                                        ) : null}

                                        {/* Active Indicator Line (Optional, subtle bottom touch) */}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full bg-primary/50 opacity-50" />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    )}
                </div>

                {/* Right Side: Controls & Profile */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        {mounted ? (
                            theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
                        ) : (
                            <span className="h-4 w-4 block" /> // placeholder to prevent layout shift
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {user ? (
                        <div className="flex items-center gap-3 pl-2 border-l border-border/40">
                            {/* Community Badge */}
                            <Badge variant="outline" className={`${communityColorClass} border font-medium hidden sm:flex items-center gap-1.5 py-1 px-2.5 capitalize`}>
                                <CommunityIcon className="w-3.5 h-3.5" />
                                {user.community}
                            </Badge>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 pl-1 pr-2 h-auto rounded-full hover:bg-accent/50">
                                        <Avatar className="w-8 h-8 border border-border/50">
                                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden sm:flex flex-col items-start text-left">
                                            <span className="text-sm font-medium leading-none">{user.name}</span>
                                        </div>
                                        <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground capitalize">{user.community} Account</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/profile">
                                            <User className="w-4 h-4 mr-2 opacity-70" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/settings">
                                            <Settings className="w-4 h-4 mr-2 opacity-70" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleSignOut}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        // Logged Out State
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild className="font-medium shadow-sm">
                                <Link href="/signup">Join Now</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}