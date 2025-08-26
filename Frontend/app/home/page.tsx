"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserPlus, MessageCircle, MapPin, Clock, Users, Edit3, Save, X, Check, Loader2 } from "lucide-react"
import { getUsersByProfession } from "@/lib/api"

interface UserProfile {
    id: string;
    name: string;
    profession: string;
    email: string;
}

interface CurrentUser {
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}

interface ConnectionStatus {
    [key: string]: 'idle' | 'loading' | 'sent' | 'error';
}

export default function HomePage() {
    const [members, setMembers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({})

    const [currentUser, setCurrentUser] = useState<CurrentUser>({
        name: "",
        community: "Loading...",
        avatar: "/placeholder.svg?height=40&width=40",
        pendingRequests: 0,
    })

    const [profileData, setProfileData] = useState({
        name: "Loading...",
        email: "Loading...",
        profession: "Loading...",
        location: "Loading...",
        connections: 0,
        bio: "Tell us about yourself, your interests, and what you're looking to achieve in this community.",
    })

    const searchParams = useSearchParams()

    useEffect(() => {
        const profession = searchParams.get('profession') || '';
        const name = searchParams.get('name') || '';
        const email = searchParams.get('email') || '';

        if (profession && name && email) {
            setProfileData((prev) => ({
                ...prev,
                name,
                email,
                profession,
                location: "Your Location", // You might want to get this from user data or geolocation
            }))

            setCurrentUser((prev) => ({
                ...prev,
                name,
                community: profession,
                avatar: "/placeholder.svg?height=40&width=40",
                pendingRequests: 0,
            }))
        }

        const fetchMembers = async () => {
            if (!profession) {
                setLoading(false);
                return;
            }

            setLoading(true)
            setError(null)
            try {
                const data = await getUsersByProfession(profession)
                setMembers(data)

                // Initialize connection status for all members
                const initialStatus: ConnectionStatus = {};
                data.forEach((member: UserProfile) => {
                    initialStatus[member.id] = 'idle';
                });
                setConnectionStatus(initialStatus);
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

        fetchMembers()
    }, [searchParams])

    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioText, setBioText] = useState(profileData.bio)
    const [tempBioText, setTempBioText] = useState(profileData.bio)

    // Update bioText when profileData.bio changes
    useEffect(() => {
        setBioText(profileData.bio);
        setTempBioText(profileData.bio);
    }, [profileData.bio]);

    const handleSendRequest = async (memberId: string, memberName: string) => {
        // Prevent default behavior and event bubbling
        event?.preventDefault();
        event?.stopPropagation();

        // Set loading state
        setConnectionStatus(prev => ({
            ...prev,
            [memberId]: 'loading'
        }));

        try {
            // Simulate API call - replace with your actual API call
            // const response = await sendConnectionRequest(memberId);

            // For now, we'll simulate a successful request with a timeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update status to sent
            setConnectionStatus(prev => ({
                ...prev,
                [memberId]: 'sent'
            }));

            // Update pending requests count
            setCurrentUser(prev => ({
                ...prev,
                pendingRequests: (prev.pendingRequests || 0) + 1
            }));

            // Optional: Show a toast notification instead of alert
            console.log(`Connection request sent to ${memberName}`);

        } catch (err) {
            console.error('Failed to send connection request:', err);
            setConnectionStatus(prev => ({
                ...prev,
                [memberId]: 'error'
            }));

            // Reset to idle after 3 seconds on error
            setTimeout(() => {
                setConnectionStatus(prev => ({
                    ...prev,
                    [memberId]: 'idle'
                }));
            }, 3000);
        }
    }

    const handleSaveBio = async () => {
        try {
            // Here you would typically save to your backend
            // await updateUserBio(tempBioText);

            setBioText(tempBioText)
            setProfileData(prev => ({ ...prev, bio: tempBioText }))
            setIsEditingBio(false)
        } catch (err) {
            console.error('Failed to save bio:', err);
            // Handle error appropriately
        }
    }

    const handleCancelBio = () => {
        setTempBioText(bioText)
        setIsEditingBio(false)
    }

    const getButtonContent = (memberId: string, memberName: string) => {
        const status = connectionStatus[memberId] || 'idle';

        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Sending...
                    </>
                );
            case 'sent':
                return (
                    <>
                        <Check className="w-3 h-3 mr-1" />
                        Sent
                    </>
                );
            case 'error':
                return (
                    <>
                        <X className="w-3 h-3 mr-1" />
                        Failed
                    </>
                );
            default:
                return (
                    <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        Connect
                    </>
                );
        }
    };

    const getButtonVariant = (memberId: string) => {
        const status = connectionStatus[memberId] || 'idle';
        return status === 'sent' ? 'secondary' : status === 'error' ? 'destructive' : 'default';
    };

    return (
        <div className="min-h-screen bg-background">
            <Header user={currentUser} />

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
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
                                    <div className="text-sm">{profileData.email}</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">About Me</h4>
                                        {!isEditingBio && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsEditingBio(true);
                                                }}
                                                className="h-6 w-6 p-0"
                                                type="button"
                                            >
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
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleSaveBio();
                                                    }}
                                                    className="flex-1"
                                                    type="button"
                                                >
                                                    <Save className="w-3 h-3 mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleCancelBio();
                                                    }}
                                                    className="flex-1 bg-transparent"
                                                    type="button"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground leading-relaxed">{bioText}</p>
                                    )}
                                </div>

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

                    {/* Middle Section */}
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

                    {/* Right Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="font-serif text-lg flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Discover {profileData.profession.charAt(0).toUpperCase() + profileData.profession.slice(1)}s
                                </CardTitle>
                                <CardDescription>
                                    Connect with fellow {profileData.profession}s in your community
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                        <span>Loading members...</span>
                                    </div>
                                )}
                                {error && (
                                    <div className="text-center py-8">
                                        <p className="text-red-500 text-sm">Error: {error}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.reload()}
                                            className="mt-2"
                                            type="button"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}
                                {!loading && members.length === 0 && !error && (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            No other members found in this community yet.
                                        </p>
                                    </div>
                                )}
                                {members.map((member) => (
                                    <div key={member.id} className="space-y-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
                                        <div className="flex items-start space-x-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={"/placeholder.svg"} alt={member.name} />
                                                <AvatarFallback className="text-sm">
                                                    {member.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{member.profession}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Button
                                                size="sm"
                                                type="button"
                                                variant={getButtonVariant(member.id)}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleSendRequest(member.id, member.name);
                                                }}
                                                disabled={connectionStatus[member.id] === 'loading' || connectionStatus[member.id] === 'sent'}
                                                className="w-full h-8 text-xs"
                                            >
                                                {getButtonContent(member.id, member.name)}
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