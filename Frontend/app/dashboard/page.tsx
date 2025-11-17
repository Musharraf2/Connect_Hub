"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card" // Removed unused imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import toast from "react-hot-toast";
import {
  Search,
  UserPlus,
  MessageCircle,
  MapPin,
  UserCheck,
  UserX,
  Edit3, 
  Save,
  X,
  Inbox,
  Briefcase
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations"
import { 
  LoginResponse, 
  Connection,
  UserProfileResponse,
  UserProfileDetailResponse,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  getPendingRequests,
  getSentPendingRequests,
  cancelConnectionRequest,
  getUserProfile,
  updateProfile,
  getAcceptedConnections,
  getUsersByProfession
} from "@/lib/api"

// --- LOCAL TYPE EXTENSIONS ---
type UserWithImage = UserProfileResponse & { profileImageUrl?: string | null };

interface ExtendedConnection {
    id: number;
    requester: UserWithImage;
    receiver: UserWithImage;
    status: string;
    createdAt: string;
}

interface CurrentUser {
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}

interface ProfileData {
    name: string;
    email: string;
    profession: string;
    location: string;
    connections: number;
    bio: string;
}

// --- URL HELPER ---
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
};

export default function DashboardPage() {
  const [members, setMembers] = useState<UserWithImage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingRequests, setPendingRequests] = useState<ExtendedConnection[]>([])
  const [sentPendingRequests, setSentPendingRequests] = useState<ExtendedConnection[]>([])
  const [connections, setConnections] = useState<ExtendedConnection[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

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
        avatar: "/placeholder.svg",
        pendingRequests: 0,
      });

      const loadInitialData = async (userId: number, userProfession: string) => {
        try {
          const profile: UserProfileDetailResponse = await getUserProfile(userId);

          setCurrentUser((prev) => (
            prev ? { ...prev, avatar: getImageUrl(profile.profileImageUrl) } : null
          ));
          
          setProfileData({
            name: profile.name,
            email: profile.email,
            profession: profile.profession,
            location: profile.location || "Not set", 
            connections: 0, 
            bio: profile.aboutMe || "No bio yet."
          });
          
          await Promise.all([
            fetchPendingRequests(userId),
            fetchSentPendingRequests(userId),
            fetchAcceptedConnections(userId),
            fetchUsersByProfession(userProfession)
          ]);
          
        } catch (err) {
          console.error("Failed to load dashboard data:", err);
          toast.error("Failed to load dashboard data.");
        } finally {
          setAuthLoading(false);
        }
      };
      
      loadInitialData(user.id, user.profession);
    }
  }, [router]);

  const fetchUsersByProfession = async (profession: string) => {
    setIsLoadingMembers(true);
    try {
      const users = await getUsersByProfession(profession);
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const currentUser: LoginResponse = JSON.parse(userDataString);
        const filteredUsers = (users as UserWithImage[]).filter(user => user.id !== currentUser.id);
        setMembers(filteredUsers);
      } else {
        setMembers(users as UserWithImage[]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchPendingRequests = async (userId: number) => {
    try {
      const requests = await getPendingRequests(userId);
      setPendingRequests(requests as unknown as ExtendedConnection[]);
      setCurrentUser((prev) => prev ? { ...prev, pendingRequests: requests.length } : null);
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  };

  const fetchSentPendingRequests = async (userId: number) => {
    try {
      const requests = await getSentPendingRequests(userId);
      setSentPendingRequests(requests as unknown as ExtendedConnection[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAcceptedConnections = async (userId: number) => {
    try {
      const conns = await getAcceptedConnections(userId);
      setConnections(conns as unknown as ExtendedConnection[]);
      setProfileData((prev) => prev ? { ...prev, connections: conns.length } : null);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Bio Edit ---
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState(profileData?.bio || "")
  const [tempBioText, setTempBioText] = useState(profileData?.bio || "")

  useEffect(() => {
      if (profileData) {
          setBioText(profileData.bio);
          setTempBioText(profileData.bio);
      }
  }, [profileData]);

  const handleSaveBio = async () => {
      const userDataString = sessionStorage.getItem('user');
      if (!userDataString || !profileData) return;
      
      const user: LoginResponse = JSON.parse(userDataString);
      try {
          const updatedUser = await updateProfile(user.id, { aboutMe: tempBioText.trim() });
          const newBio = updatedUser.aboutMe ?? "";
          setBioText(newBio);
          setTempBioText(newBio);
          setProfileData(prev => prev ? { ...prev, bio: newBio } : null);
          setIsEditingBio(false);
          toast.success("Bio updated!");
      } catch (error) {
          toast.error("Failed to update bio.");
      }
  };

  // --- Connection Handlers ---
  const handleSendRequest = async (memberId: number) => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) return;
    const user: LoginResponse = JSON.parse(userDataString);
    try {
      await sendConnectionRequest(user.id, memberId);
      fetchSentPendingRequests(user.id);
      toast.success("Request sent");
    } catch (error) {
      toast.error("Failed to send request");
    }
  }
  
  const handleCancelRequest = async (connectionId: number) => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) return;
    const user: LoginResponse = JSON.parse(userDataString);
    try {
      await cancelConnectionRequest(connectionId);
      fetchSentPendingRequests(user.id);
      toast.success("Request canceled");
    } catch (error) {
      toast.error("Failed to cancel request");
    }
  }
  
  const handleAcceptRequest = async (connectionId: number) => {
    try {
      await acceptConnectionRequest(connectionId);
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      setCurrentUser(prev => prev ? { ...prev, pendingRequests: (prev.pendingRequests || 1) - 1 } : null);
      toast.success("Connection accepted!");

      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const user: LoginResponse = JSON.parse(userDataString);
        fetchAcceptedConnections(user.id); 
        fetchUsersByProfession(user.profession); 
      }
    } catch (error) {
      toast.error("Failed to accept request");
    }
  }
  
  const handleDeclineRequest = async (connectionId: number) => {
    try {
      await declineConnectionRequest(connectionId);
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      setCurrentUser(prev => prev ? { ...prev, pendingRequests: (prev.pendingRequests || 1) - 1 } : null);
      toast.success("Request declined");
    } catch (error) {
      toast.error("Failed to decline request");
    }
  }

  const getConnectionStatus = (userId: number) => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) return { status: 'none' };
    const currentUser: LoginResponse = JSON.parse(userDataString);

    const sentRequest = sentPendingRequests.find(req => req.requester.id === currentUser.id && req.receiver.id === userId);
    if (sentRequest) return { status: 'pending', connectionId: sentRequest.id };

    const isConnected = connections.some(conn => 
        (conn.requester.id === currentUser.id && conn.receiver.id === userId) ||
        (conn.receiver.id === currentUser.id && conn.requester.id === userId)
    );
    if (isConnected) return { status: 'connected' };
    return { status: 'none' };
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profession.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const { status } = getConnectionStatus(member.id);
    return status !== 'connected';
  });

  if (authLoading || !currentUser || !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header user={{...currentUser, pendingRequests: pendingRequests.length}} />

      <main className="container mx-auto grid lg:grid-cols-3 gap-8 py-8 px-4">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <FadeInUp>
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <CardContent className="p-6 pt-0 relative">
                      <div className="flex justify-center -mt-12 mb-4">
                          <Avatar className="w-24 h-24 border-4 border-card shadow-sm">
                              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={profileData.name} />
                              <AvatarFallback className="text-xl bg-muted">
                                  {profileData.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                          </Avatar>
                      </div>

                      <div className="text-center mb-6">
                          <h2 className="font-serif text-xl font-bold text-foreground">{profileData.name}</h2>
                          <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-1.5">
                              <span className="font-medium text-primary">{profileData.profession}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                              <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {profileData.location}
                              </span>
                          </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-border mb-4">
                          <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="font-bold text-lg text-foreground">{profileData.connections}</div>
                              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Connections</div>
                          </div>
                          <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="font-bold text-lg text-foreground">{pendingRequests.length}</div>
                              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Requests</div>
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">About</h4>
                              {!isEditingBio && (
                                  <Button variant="ghost" size="icon" onClick={() => setIsEditingBio(true)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                      <Edit3 className="w-3.5 h-3.5" />
                                  </Button>
                              )}
                          </div>
                          {isEditingBio ? (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                  <Textarea
                                      value={tempBioText}
                                      onChange={(e) => setTempBioText(e.target.value)}
                                      placeholder="Tell us about yourself..."
                                      className="min-h-[100px] text-sm bg-muted/50 border-border focus:border-primary resize-none"
                                  />
                                  <div className="flex gap-2">
                                      <Button size="sm" onClick={handleSaveBio} className="flex-1 h-8">
                                          <Save className="w-3 h-3 mr-1.5" /> Save
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setIsEditingBio(false)} className="flex-1 h-8 bg-transparent">
                                          <X className="w-3 h-3 mr-1.5" /> Cancel
                                      </Button>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                                  {bioText}
                              </p>
                          )}
                      </div>
                  </CardContent>
              </Card>
            </FadeInUp>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full lg:col-span-2 space-y-6">
          <FadeInUp delay={0.1}>
            <Tabs defaultValue="discover" className="space-y-6">
              
              <TabsList className="w-full grid grid-cols-3 h-12 p-1 bg-muted/60 backdrop-blur-sm rounded-xl border border-border/50">
                <TabsTrigger value="discover" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                    Discover
                </TabsTrigger>
                <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all relative">
                  Requests
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-background">
                      {pendingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="connections" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                    My Connections
                </TabsTrigger>
              </TabsList>

              {/* Discover Tab - REDESIGNED COMPACT CARDS */}
              <TabsContent value="discover" className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search people by name or profession..."
                    className="pl-10 h-12 rounded-full bg-card border-border shadow-sm focus-visible:ring-primary/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {isLoadingMembers ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground animate-pulse">Finding people...</p>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">No results found</h3>
                    <p className="text-muted-foreground text-sm mt-1">Try adjusting your search terms.</p>
                  </div>
                ) : (
                  // --- UPDATED GRID GAP ---
                  <StaggerContainer stagger={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMembers.map((member) => {
                      const connectionStatus = getConnectionStatus(member.id);
                      return (
                        <StaggerItem key={member.id}>
                          <Card className="group hover:shadow-md transition-all duration-300 border-border hover:border-primary/50 bg-card overflow-hidden">
                            {/* --- UPDATED CARD CONTENT: Compact & Horizontal --- */}
                            <CardContent className="p-4 flex items-center gap-4">
                              {/* Avatar */}
                              <Avatar className="w-12 h-12 border border-border group-hover:border-primary/30 transition-colors shrink-0">
                                <AvatarImage src={getImageUrl(member.profileImageUrl)} alt={member.name} className="object-cover"/>
                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-medium">
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm truncate">{member.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                    <Briefcase className="w-3 h-3" />
                                    <span className="truncate">{member.profession}</span>
                                </div>
                              </div>

                              {/* Action Button (Right aligned) */}
                              <div className="shrink-0">
                                {connectionStatus.status === 'none' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSendRequest(member.id)} 
                                    className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary border-0 shadow-none text-xs font-medium"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                    Connect
                                  </Button>
                                )}
                                {connectionStatus.status === 'pending' && connectionStatus.connectionId && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleCancelRequest(connectionStatus.connectionId!)}
                                    className="h-8 px-3 text-muted-foreground hover:text-destructive hover:border-destructive/50 text-xs"
                                  >
                                    <X className="w-3.5 h-3.5 mr-1.5" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                )}
              </TabsContent>

              {/* Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Connection Requests</h2>
                    <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{pendingRequests.length} pending</span>
                </div>
                
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground">No pending requests</h3>
                        <p className="text-muted-foreground text-sm mt-1">When people want to connect, they'll appear here.</p>
                    </div>
                ) : (
                    <StaggerContainer stagger={0.1} className="space-y-4">
                    {pendingRequests.map((request) => {
                        const requesterName = request.requester?.name || "Unknown User";
                        return (
                        <StaggerItem key={request.id}>
                            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-card">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="w-12 h-12 border border-border">
                                    <AvatarImage src={getImageUrl(request.requester?.profileImageUrl)} alt={requesterName} />
                                    <AvatarFallback>{requesterName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                    <h3 className="font-semibold text-foreground">{requesterName}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span className="font-medium text-primary">{request.requester?.profession || "N/A"}</span>
                                        <span className="text-xs">•</span>
                                        <span className="text-xs">{request.requester?.email || "N/A"}</span>
                                    </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button className="flex-1 sm:flex-none" size="sm" onClick={() => handleAcceptRequest(request.id)}>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Accept
                                    </Button>
                                    <Button className="flex-1 sm:flex-none text-muted-foreground hover:text-destructive" size="sm" variant="outline" onClick={() => handleDeclineRequest(request.id)}>
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
                )}
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">My Connections</h2>
                    <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{connections.length} total</span>
                </div>

                {connections.length === 0 ? (
                    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground">No connections yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">Go to the Discover tab to find people!</p>
                    </div>
                ) : (
                    <StaggerContainer stagger={0.05} className="grid md:grid-cols-2 lg:grid-cols-2 gap-5">
                    {connections.map((connection) => {
                        const userDataString = sessionStorage.getItem('user');
                        if (!userDataString) return null;
                        const currentLoggedInUser: LoginResponse = JSON.parse(userDataString);
                        
                        const otherUser = connection.requester.id === currentLoggedInUser.id 
                        ? connection.receiver 
                        : connection.requester;
                        
                        const otherUserName = otherUser?.name || "Unknown User";
                        
                        return (
                        <StaggerItem key={connection.id}>
                            <Card className="group hover:shadow-md transition-all duration-300 border-border hover:border-primary/30 bg-card">
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="w-12 h-12 border border-border group-hover:border-primary/20">
                                <AvatarImage src={getImageUrl(otherUser?.profileImageUrl)} alt={otherUserName} />
                                <AvatarFallback className="bg-secondary/10 text-secondary-foreground">
                                    {otherUserName.charAt(0)}
                                </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate text-sm">{otherUserName}</h3>
                                <p className="text-xs text-muted-foreground truncate">{otherUser?.profession || "N/A"}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full h-8 w-8">
                                <MessageCircle className="w-4 h-4" />
                                </Button>
                            </CardContent>
                            </Card>
                        </StaggerItem>
                        );
                    })}
                    </StaggerContainer>
                )}
              </TabsContent>
            </Tabs>
          </FadeInUp>
        </section>
      </main>
    </div>
  )
}