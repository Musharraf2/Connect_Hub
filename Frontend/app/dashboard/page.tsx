"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import {
  Search,
  UserPlus,
  MessageCircle,
  BookOpen,
  Music,
  Stethoscope,
  Zap,
  MapPin,
  UserCheck,
  UserX,
  Clock,
  Users,
  Edit3, // Import icons for bio edit
  Save,
  X,
} from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea" // Import Textarea
import { motion } from "framer-motion"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations"
import { 
  LoginResponse, 
  Connection,
  UserProfileResponse,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  getPendingRequests,
  getAcceptedConnections,
  getUsersByProfession
} from "@/lib/api"


// --- Define User Types ---
// For the Header component
interface CurrentUser {
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}
// For the Profile Card
interface ProfileData {
    name: string;
    email: string;
    profession: string;
    location: string;
    connections: number;
    bio: string;
}

// --- End User Types ---


const communityIcons = {
  student: BookOpen,
  teacher: Users,
  musician: Music,
  doctor: Stethoscope,
  dancer: Zap,
}

const communityColors = {
  student: "bg-blue-100 text-blue-700 border-blue-200",
  teacher: "bg-green-100 text-green-700 border-green-200",
  musician: "bg-purple-100 text-purple-700 border-purple-200",
  doctor: "bg-red-100 text-red-700 border-red-200",
  dancer: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

export default function DashboardPage() {
  const [members, setMembers] = useState<UserProfileResponse[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  // --- Auth & Profile State ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
      router.push('/login');
    } else {
      const user: LoginResponse = JSON.parse(userDataString);

      setCurrentUser({
        name: user.name,
        community: user.profession,
        avatar: "/placeholder.svg?height=40&width=40",
        pendingRequests: 0, // Will be updated after fetching
      });
      
      setProfileData({
        name: user.name,
        email: user.email,
        profession: user.profession,
        location: "New York, NY", // Mocked
        connections: 0, // Will be updated after fetching
        bio: "Passionate about my field and eager to connect with fellow professionals!",
      });

      // Fetch pending requests and accepted connections
      fetchPendingRequests(user.id);
      fetchAcceptedConnections(user.id);
      // Fetch users by profession
      fetchUsersByProfession(user.profession);

      setAuthLoading(false);
    }
  }, [router]);
  // --- End Auth & Profile State ---

  // Fetch users by profession
  const fetchUsersByProfession = async (profession: string) => {
    setIsLoadingMembers(true);
    try {
      const users = await getUsersByProfession(profession);
      // Filter out the current user
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const currentUser: LoginResponse = JSON.parse(userDataString);
        const filteredUsers = users.filter(user => user.id !== currentUser.id);
        setMembers(filteredUsers);
      } else {
        setMembers(users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async (userId: number) => {
    try {
      const requests = await getPendingRequests(userId);
      setPendingRequests(requests);
      // Update the pending requests count in currentUser
      setCurrentUser((prev: CurrentUser | null) => prev ? { ...prev, pendingRequests: requests.length } : null);
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  };

  // Fetch accepted connections
  const fetchAcceptedConnections = async (userId: number) => {
    try {
      const conns = await getAcceptedConnections(userId);
      setConnections(conns);
      // Update the connections count in profileData
      setProfileData((prev: ProfileData | null) => prev ? { ...prev, connections: conns.length } : null);
    } catch (error) {
      console.error("Failed to fetch accepted connections:", error);
    }
  };


  // --- Bio Edit State & Handlers ---
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState(profileData?.bio || "")
  const [tempBioText, setTempBioText] = useState(profileData?.bio || "")

  useEffect(() => {
      if (profileData) {
          setBioText(profileData.bio);
          setTempBioText(profileData.bio);
      }
  }, [profileData]);

  const handleSaveBio = () => {
      setBioText(tempBioText)
      setIsEditingBio(false)
  }

  const handleCancelBio = () => {
      setTempBioText(bioText)
      setIsEditingBio(false)
  }
  // --- End Bio Edit State ---


  // --- Connection Handlers ---
  const handleSendRequest = async (memberId: number) => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) return;
    
    const user: LoginResponse = JSON.parse(userDataString);
    try {
      await sendConnectionRequest(user.id, memberId);
      // Optionally remove the member from the list after sending request
      // Or you could add a status indicator
      console.log("Connection request sent successfully");
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  }
  
  const handleAcceptRequest = async (connectionId: number) => {
    try {
      await acceptConnectionRequest(connectionId);
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      // Refetch connections
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const user: LoginResponse = JSON.parse(userDataString);
        fetchAcceptedConnections(user.id);
      }
    } catch (error) {
      console.error("Failed to accept connection request:", error);
    }
  }
  
  const handleDeclineRequest = async (connectionId: number) => {
    try {
      await declineConnectionRequest(connectionId);
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error("Failed to decline connection request:", error);
    }
  }
  // --- End Connection Handlers ---

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profession.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (authLoading || !currentUser || !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />

      <main className="container mx-auto grid lg:grid-cols-3 gap-8 py-8">
        
        {/* Left Sidebar (Sticky) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <FadeInUp>
              {/* User Profile Card - Now REAL data */}
              <Card className="bg-card/50 rounded-2xl border">
                  <CardContent className="p-6">
                      <div className="text-center pb-4">
                          <Avatar className="w-24 h-24 mx-auto mb-4">
                              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={profileData.name} />
                              <AvatarFallback className="text-xl">
                                  {profileData.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                          </Avatar>
                          <h2 className="font-serif text-xl font-semibold">{profileData.name}</h2>
                          <p className="text-muted-foreground text-sm space-y-1 mt-2">
                              <span className="font-medium">{profileData.profession}</span>
                              <span className="flex items-center justify-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{profileData.location}</span>
                              </span>
                          </p>
                      </div>
                      <div className="space-y-4">
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
                          
                          {/* Bio Section */}
                          <div className="space-y-2 pt-4 border-t">
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
                                              <Save className="w-3 h-3 mr-1" /> Save
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={handleCancelBio} className="flex-1 bg-transparent">
                                              <X className="w-3 h-3 mr-1" /> Cancel
                                          </Button>
                                      </div>
                                  </div>
                              ) : (
                                  <p className="text-sm text-muted-foreground leading-relaxed">{bioText}</p>
                              )}
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Community Stats Card (Mocked) */}
              <Card className="bg-card/50 rounded-2xl border">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Students</span>
                    <span className="font-medium">12,547</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Today</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New This Week</span>
                    <span className="font-medium">89</span>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>
          </div>
        </aside>

        {/* Main Content (Scrolling) */}
        <section className="w-full lg:col-span-2 space-y-6">
          <FadeInUp delay={0.1}>
            <Tabs defaultValue="discover" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="requests" className="relative">
                  Requests
                  {(currentUser.pendingRequests ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {currentUser.pendingRequests}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="connections">My Connections</TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or profession..."
                    className="pl-10 bg-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Discover People in Your Field</h2>
                {isLoadingMembers ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found in your profession yet.</p>
                  </div>
                ) : (
                  <StaggerContainer stagger={0.1} className="grid md:grid-cols-2 gap-6">
                    {filteredMembers.map((member) => (
                      <StaggerItem key={member.id}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src="/placeholder.svg" alt={member.name} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="font-serif text-lg">{member.name}</CardTitle>
                                <CardDescription className="space-y-1">
                                  <div className="font-medium">{member.profession}</div>
                                  <div className="text-sm">{member.email}</div>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-end">
                              <Button size="sm" onClick={() => handleSendRequest(member.id)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">Connection Requests</h2>
                <StaggerContainer stagger={0.1} className="space-y-4">
                  {pendingRequests.map((request) => {
                    const requesterName = request.requester?.name || "Unknown User";
                    return (
                      <StaggerItem key={request.id}>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src="/placeholder.svg" alt={requesterName} />
                                  <AvatarFallback>
                                    {requesterName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-serif font-semibold">{requesterName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {request.requester?.profession || "N/A"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.requester?.email || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(request.id)}>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  My Connections ({connections.length})
                </h2>
                <StaggerContainer stagger={0.1} className="grid md:grid-cols-2 gap-4">
                  {connections.map((connection) => {
                    const userDataString = sessionStorage.getItem('user');
                    if (!userDataString) return null;
                    const currentLoggedInUser: LoginResponse = JSON.parse(userDataString);
                    
                    // Determine which user to display (the other person in the connection)
                    const otherUser = connection.requester.id === currentLoggedInUser.id 
                      ? connection.receiver 
                      : connection.requester;
                    
                    const otherUserName = otherUser?.name || "Unknown User";
                    
                    return (
                      <StaggerItem key={connection.id}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 text-center">
                            <Avatar className="w-16 h-16 mx-auto mb-3">
                              <AvatarImage src="/placeholder.svg" alt={otherUserName} />
                              <AvatarFallback>
                                {otherUserName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-serif font-semibold mb-1">{otherUserName}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{otherUser?.profession || "N/A"}</p>
                            <Button size="sm" variant="outline" className="w-full bg-transparent">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </TabsContent>
            </Tabs>
          </FadeInUp>
        </section>
      </main>
      
      {/* Footer is Removed */}
    </div>
  )
}