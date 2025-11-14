"use client"

import { useState } from "react"
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
    BookOpen,
    Music,
    Stethoscope,
    Zap,
    Home,
    MessageCircle,
    User,
    Settings,
    LogOut,
    Moon,
    Sun,
    ChevronDown,
    Briefcase, // <-- Import a generic "briefcase" icon
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

// The HeaderProps now accepts a more general 'string' for community.
interface HeaderProps {
    user?: {
        id?: number // <-- This is correct
        name: string
        community: string
        avatar: string
        pendingRequests?: number
    }
}

// We keep the specific icons for our "main" communities
const communityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    student: BookOpen,
    teacher: Users,
    musician: Music,
    doctor: Stethoscope,
    dancer: Zap,
}

// We keep the specific colors for our "main" communities with modern palette
const communityColors: Record<string, string> = {
    student: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent shadow-sm",
    teacher: "bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-sm",
    musician:
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent shadow-sm",
    doctor: "bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent shadow-sm",
    dancer:
        "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-sm",
}

export function Header({ user }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    // --- THIS LOGIC IS NOW UPDATED ---
    const communityKey = user?.community.toLowerCase() || "";
    // Get the specific icon, OR use the default Briefcase icon
    const CommunityIcon = communityIcons[communityKey] || Briefcase;
    // Get the specific color, OR use a default gradient
    const communityColorClass = communityColors[communityKey] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-transparent shadow-sm";
    // --- END OF UPDATE ---

    const handleSignOut = () => {
        sessionStorage.removeItem('user');
        router.push('/');
    };

    return (
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href={user ? "/home" : "/"} className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-serif font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ConnectHub</span>
                        </Link>

                        {user && (
                            <nav className="hidden md:flex items-center space-x-1">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/dashboard" className="flex items-center space-x-2">
                                        <Home className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/community" className="flex items-center space-x-2">
                                        {/* This will now show the default icon if needed */}
                                        <CommunityIcon className="w-4 h-4" />
                                        <span>My Community</span>
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/messages" className="flex items-center space-x-2">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Messages</span>
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" className="relative" asChild>
                                    <Link href="/notifications" className="flex items-center space-x-2">
                                        <Bell className="w-4 h-4" />
                                        <span>Notifications</span>
                                        {user.pendingRequests && user.pendingRequests > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {user.pendingRequests}
                      </span>
                                        )}
                                    </Link>
                                </Button>
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-9 h-9 p-0"
                        >
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Badge className={`${communityColorClass} font-medium hidden sm:flex`}>
                                    {/* This will now show the default icon if needed */}
                                    <CommunityIcon className="w-4 h-4 mr-1" />
                                    {/* This will show ANY string, e.g., "Painter" */}
                                    {user.community.charAt(0).toUpperCase() + user.community.slice(1)}
                                </Badge>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                                <AvatarFallback>
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-foreground hidden sm:block">{user.name}</span>
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings" className="flex items-center">
                                                <Settings className="w-4 h-4 mr-2" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            // Guest navigation
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="#about">About</Link>
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href="#communities">Communities</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Join Now</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}