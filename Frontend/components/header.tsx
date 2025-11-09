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
const communityIcons: Record<string, any> = {
    student: BookOpen,
    teacher: Users,
    musician: Music,
    doctor: Stethoscope,
    dancer: Zap,
}

// We keep the specific colors for our "main" communities
const communityColors: Record<string, string> = {
    student: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800",
    teacher: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800",
    musician:
        "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800",
    doctor: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",
    dancer:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800",
}

export function Header({ user }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    // --- THIS LOGIC IS NOW UPDATED ---
    const communityKey = user?.community.toLowerCase() || "";
    // Get the specific icon, OR use the default Briefcase icon
    const CommunityIcon = communityIcons[communityKey] || Briefcase;
    // Get the specific color, OR use a default gray color
    const communityColorClass = communityColors[communityKey] || "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800";
    // --- END OF UPDATE ---

    const handleSignOut = () => {
        sessionStorage.removeItem('user');
        router.push('/');
    };

    return (
        <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href={user ? "/home" : "/"} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-serif font-bold text-foreground">ConnectHub</span>
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