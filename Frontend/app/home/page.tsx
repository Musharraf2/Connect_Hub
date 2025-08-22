"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserPlus, MessageCircle, MapPin, Clock, Users, Edit3, Save, X } from "lucide-react"
import { getUsersByProfession } from "@/lib/api"

// Define the types for the data we'll get from the backend
interface UserProfile {
    id: string;
    name: string;
    profession: string;
    email: string;
}

// Define the types for the user data required by the Header component.
// This is to match the props expected by the Header component.
interface CurrentUser {
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}

export default function HomePage() {
    const [members, setMembers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // State for the current logged-in user's profile
    const [currentUser, setCurrentUser] = useState<CurrentUser>({
        name: "",
        community: "Loading...",
        avatar: "/placeholder.svg?height=40&width=40",
        pendingRequests: 0,
    })

    // State for the main profile card display
    const [profileData, setProfileData] = useState({
        name: "Loading...",
        email: "Loading...",
        profession: "Loading...",
        location: "Loading...",
        connections: 0,
        bio: "Loading...",
    })

    const searchParams = useSearchParams()

    useEffect(() => {
        const profession = searchParams.get('profession') || '';
        const name = searchParams.get('name') || '';
        const email = searchParams.get('email') || '';

        // Update the state for the main profile card
        if (profession && name && email) {
            setProfileData({
                ...profileData,
                name: name,
                email: email,
                profession: profession,
            });

            // Update the state for the Header component to match its required props
            setCurrentUser({
                name: name,
                community: profession,
                avatar: "/placeholder.svg?height=40&width=40",
                pendingRequests: 0, // Assuming 0 for now
            });
        }

        const fetchMembers = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getUsersByProfession(profession)
                setMembers(data)
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Failed to fetch members.");
                }
            } finally {
                setLoading(false)
            }
        }

        if (profession) {
            fetchMembers()
        }
    }, [searchParams])


    // State and handlers for the Bio section
    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioText, setBioText] = useState(profileData.bio)
    const [tempBioText, setTempBioText] = useState(profileData.bio)

    const handleSendRequest = (memberId: string) => {
        console.log(`Sending connection request to user with ID: ${memberId}`);
    }

    const handleSaveBio = () => {
        setBioText(tempBioText)
        setIsEditingBio(false)
    }

    const handleCancelBio = () => {
        setTempBioText(bioText)
        setIsEditingBio(false)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* The Header now receives an object that matches its required props */}
            <Header user={currentUser} />

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Sidebar - User Profile Card */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="sticky top-24">
                            <CardHeader className="text-center pb-4">
                                <Avatar className="w-24 h-24 mx-auto mb-4">
                                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={profileData.name} />
                                    <AvatarFallback className="text-xl">
                                        {profileData.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="font-serif text-xl">{profileData.name}</CardTitle>
                                <CardDescription className="space-y-1">
                                    <div className="flex items-center justify-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profileData.location}</span>
                                    </div>
                                    <div className="font-medium">{profileData.profession}</div>
                                    <div className="text-sm">
                                        {profileData.email}
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Bio Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">About Me</h4>
                                        {!isEditingBio && (
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(true)} className="h-6 w-6 p-0">
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                    {isEditingBio ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={tempBioText}
                                                onChange={(e) => setTempBioText(e.target.value)}
                                                placeholder="Write something about yourself..."
                                                className="min-h-[80px] text-sm"
                                            />
                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={handleSaveBio} className="flex-1">
                                                    <Save className="w-3 h-3 mr-1" />
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCancelBio} className="flex-1 bg-transparent">
                                                    <X className="w-3 h-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground leading-relaxed">{bioText}</p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="text-center">
                                        <div className="font-semibold text-lg">{profileData.connections}</div>
                                        <div className="text-xs text-muted-foreground">Connections</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-lg">{currentUser.pendingRequests}</div>
                                        <div className="text-xs text-muted-foreground">Requests</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Section - Blank for now */}
                    <div className="lg:col-span-6">
                        <Card className="h-96 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-serif text-xl font-semibold">Coming Soon</h3>
                                    <p className="text-muted-foreground">
                                        This space will feature your personalized feed and updates from your community.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Sidebar - Community Members */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="font-serif text-lg flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Discover {profileData.profession.charAt(0).toUpperCase() + profileData.profession.slice(1)}s
                                </CardTitle>
                                <CardDescription>Connect with fellow {profileData.profession}s in your community</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                                {loading && <p>Loading members...</p>}
                                {error && <p className="text-red-500">Error: {error}</p>}
                                {!loading && members.length === 0 && !error && <p>No other members found in this community.</p>}
                                {members.map((member) => (
                                    <div key={member.id} className="space-y-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={"/placeholder.svg"} alt={member.name} />
                                                <AvatarFallback className="text-sm">
                                                    {member.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{member.profession}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Button size="sm" onClick={() => handleSendRequest(member.id)} className="w-full h-8 text-xs">
                                                <UserPlus className="w-3 h-3 mr-1" />
                                                Connect
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
