"use client"

import { useState, useEffect } from "react" // Import hooks
import { useRouter } from "next/navigation" // Import router
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getUserProfile,
  UserProfileResponse,
  UserProfileDetailResponse,
  updateProfile,
  ProfileUpdatePayload,
  uploadProfileImage,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Textarea } from "@/components/ui/textarea" 
import { ImageUpload } from "@/components/image-upload"
import {
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Settings,
  Edit,
  BookOpen,
  Music,
  Stethoscope,
  Zap,
  Mail,
  Phone,
  Award,
  Save,
  X,
  Edit3,
  Camera,
} from "lucide-react"
import Link from "next/link"
import { LoginResponse } from "@/app/login/page" // Import session type
import { motion } from "framer-motion"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// This is our MOCKED data. We will merge session data into this.
const profileMockData = {
  id: 1,
  name: "Mock User",
  email: "mock@email.com",
  phone: "+1 (555) 123-4567",
  profession: "student",
  community: "student",
  avatar: "/placeholder.svg?height=120&width=120",
  coverImage: "/placeholder.svg?height=200&width=800",
  location: "New York, NY",
  joinDate: "January 2024",
  connections: 45,
  pendingRequests: 3,
  bio: "Computer Science student passionate about AI and machine learning. Always eager to connect with fellow students and learn from their experiences.",
  university: "Columbia University",
  major: "Computer Science",
  year: "Junior",
  gpa: "3.8",
  skills: ["Python", "JavaScript", "React", "Machine Learning", "Data Analysis"],
  interests: ["Artificial Intelligence", "Web Development", "Data Science", "Startups"],
  achievements: ["Dean's List Fall 2023", "Hackathon Winner - TechCrunch Disrupt", "Google Summer of Code Participant"],
  projects: [
    {
      title: "AI Study Buddy",
      description: "An AI-powered study companion that helps students organize their learning",
      tech: ["Python", "TensorFlow", "React"],
    },
    {
      title: "Campus Connect",
      description: "A social platform for university students to find study groups",
      tech: ["Node.js", "MongoDB", "React Native"],
    },
  ],
}

// Define the full user type
// Define the full user type based on our new API response
type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone: string; // from mock
  profession: string;
  community: string;
  avatar: string; // from mock
  coverImage: string; // from mock
  location: string;
  joinDate: string; // from mock
  connections: number; // from mock
  pendingRequests: number; // from mock
  bio: string;
  
  // REAL DATA FROM API
  university: string;
  major: string;
  year: string;
  gpa: string;
  skills: string[]; // We will map the Skill[] objects to string[]
  interests: string[]; // We will map the Interest[] objects to string[]

  // from mock
  achievements: string[];
  projects: { title: string; description: string; tech: string[]; }[];
};

const communityIcons = {
  student: BookOpen,
  teacher: Users,
  musician: Music,
  doctor: Stethoscope,
  dancer: Zap,
}

const communityColors = {
  student: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent shadow-sm",
  teacher: "bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-sm",
  musician: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent shadow-sm",
  doctor: "bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent shadow-sm",
  dancer: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-sm",
}

const recentActivity = [
  { id: 1, type: "connection", message: "Connected with Sarah Chen", time: "2 hours ago" },
  { id: 2, type: "request", message: "Received connection request from Marcus Williams", time: "1 day ago" },
  { id: 3, type: "message", message: "New message from Emily Rodriguez", time: "2 days ago" },
]

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  
  // Profile image upload state
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

 useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
      router.push('/login');
      return; // Stop execution
    }

    const sessionUser: UserProfileResponse = JSON.parse(userDataString);
    if (!sessionUser?.id) {
        router.push('/login');
        return; // Stop execution
    }

    // Fetch the REAL profile data
    (async () => {
      try {
        // 1. Fetch the most up-to-date profile from the database
        const profile = await getUserProfile(sessionUser.id);

        // 2. Merge real data with mock data (for fields you haven't built yet)
        setCurrentUser({
          ...profileMockData, // Use mock for projects, achievements, etc.
          
          // --- REAL USER DATA ---
          id: profile.id,
          name: profile.name,
          email: profile.email,
          profession: profile.profession,
          community: profile.profession,
          location: profile.location ?? "No location set",
          bio: profile.aboutMe ?? "No bio set",

          // --- REAL ACADEMIC DATA ---
          university: profile.academicInfo?.university ?? "Not specified",
          major: profile.academicInfo?.major ?? "Not specified",
          year: profile.academicInfo?.year ?? "Not specified",
          gpa: profile.academicInfo?.gpa ?? "Not specified",

          // --- REAL SKILLS & INTERESTS ---
          // Map the {id, skill} objects to simple strings
          skills: profile.skills.map(s => s.skill),
          interests: profile.interests.map(i => i.interest),

          connections: (profile as UserProfileDetailResponse).connectionsCount ?? (profile as UserProfileDetailResponse).connections ?? (profile as UserProfileDetailResponse).totalConnections ?? 0,
          pendingRequests: (profile as UserProfileDetailResponse).pendingRequestsCount ?? (profile as UserProfileDetailResponse).pendingRequests ?? 0,
        });

      } catch (error) {
        console.error("Failed to fetch profile", error);
        toast.error("Could not load profile. Logging out.");
        router.push('/login'); // Failed to load, send to login
      } finally {
        setAuthLoading(false);
      }
    })();

  }, [router]);
  // --- Bio Edit State & Handlers ---
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState(currentUser?.bio || "") // Use currentUser
  const [tempBioText, setTempBioText] = useState(currentUser?.bio || "")

  useEffect(() => {
      if (currentUser) {
          setBioText(currentUser.bio);
          setTempBioText(currentUser.bio);
      }
  }, [currentUser]);

 const handleSaveBio = async () => { // Make it async
    if (!currentUser) return;

    // Show a loading toast
    const toastId = toast.loading("Saving bio...");
    
    const payload: ProfileUpdatePayload = {
      aboutMe: tempBioText, // Only send the new bio
    };

    try {
      // Call the API
      const updatedUser = await updateProfile(currentUser.id, payload);

      // Update the main currentUser state
      setCurrentUser({ ...currentUser, bio: updatedUser.aboutMe ?? "" });

      // Update the local bio text state
      setBioText(updatedUser.aboutMe ?? "");

      // Update session storage so it persists after a refresh
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Bio updated!", { id: toastId });
    } catch (error) {
      console.error("Failed to save bio", error);
      toast.error("Could not save bio.", { id: toastId });
    } finally {
      setIsEditingBio(false);
    }
  };

  const handleCancelBio = () => {
      setTempBioText(bioText)
      setIsEditingBio(false)
  }
  // --- End Bio Edit State ---

  // Profile image upload handlers
  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file)
  }

  const handleImageUpload = async () => {
    if (!selectedImageFile || !currentUser) return

    setIsUploadingProfileImage(true)
    const toastId = toast.loading("Uploading profile image...")

    try {
      const result = await uploadProfileImage(currentUser.id, selectedImageFile)
      
      // Update the current user state with new profile image
      const updatedAvatar = `http://localhost:8080/api/files/${result.profileImageUrl}`
      setCurrentUser({ ...currentUser, avatar: updatedAvatar })
      
      toast.success("Profile image updated!", { id: toastId })
      setShowImageUploadDialog(false)
      setSelectedImageFile(null)
    } catch (error) {
      console.error("Failed to upload profile image", error)
      toast.error("Failed to upload image", { id: toastId })
    } finally {
      setIsUploadingProfileImage(false)
    }
  }

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const CommunityIcon = communityIcons[currentUser.community as keyof typeof communityIcons] || Users // Added default icon
  const communityColorClass = communityColors[currentUser.community as keyof typeof communityColors] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-transparent shadow-sm" // Added default color

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <FadeInUp>
          <Card className="mb-8 bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
            <div className="relative">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-t-3xl"></div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                  <div className="relative mb-4 md:mb-0">
                    <Avatar className="w-32 h-32 border-4 border-background">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                      <AvatarFallback className="text-2xl">
                        {currentUser.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0"
                      onClick={() => setShowImageUploadDialog(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{currentUser.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{currentUser.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {currentUser.joinDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{currentUser.connections} connections</span>
                          </div>
                        </div>
                        <Badge className={`${communityColorClass} font-medium mb-4`}>
                          <CommunityIcon className="w-4 h-4 mr-1" />
                          {currentUser.community.charAt(0).toUpperCase() + currentUser.community.slice(1)} Community
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button asChild>
                          <Link href="/profile/edit">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeInUp>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content (Scrolling) */}
          <section className="lg:col-span-2 space-y-6">
            <FadeInUp delay={0.1}>
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="font-serif">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* --- This is the section that was broken --- */}
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
                        <div className="flex items-start justify-between">
                          <p className="text-muted-foreground leading-relaxed mr-4">{bioText}</p>
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(true)} className="h-6 w-6 p-0 shrink-0">
                              <Edit3 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {/* --- End of broken section fix --- */}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="font-serif">Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">University</h4>
                          <p className="text-muted-foreground">{currentUser.university}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Major</h4>
                          <p className="text-muted-foreground">{currentUser.major}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Year</h4>
                          <p className="text-muted-foreground">{currentUser.year}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">GPA</h4>
                          <p className="text-muted-foreground">{currentUser.gpa}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="font-serif">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StaggerContainer stagger={0.05} className="flex flex-wrap gap-2">
                        {currentUser.skills.map((skill, index) => (
                          <StaggerItem key={index}>
                            <Badge variant="secondary">
                              {skill}
                            </Badge>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="font-serif">Interests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StaggerContainer stagger={0.05} className="flex flex-wrap gap-2">
                        {currentUser.interests.map((interest, index) => (
                          <StaggerItem key={index}>
                            <Badge variant="outline">
                              {interest}
                            </Badge>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                  <StaggerContainer stagger={0.1} className="space-y-6">
                    {currentUser.projects.map((project, index) => (
                      <StaggerItem key={index}>
                        <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                          <CardHeader>
                            <CardTitle className="font-serif">{project.title}</CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {project.tech.map((tech, techIndex) => (
                                <Badge key={techIndex} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="font-serif">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StaggerContainer stagger={0.1} className="space-y-4">
                        {recentActivity.map((activity) => (
                          <StaggerItem key={activity.id}>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-foreground">{activity.message}</p>
                                <p className="text-sm text-muted-foreground">{activity.time}</p>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </FadeInUp>
          </section>

          {/* Sidebar (Sticky) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <FadeInUp delay={0.2}>
                <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-serif">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{currentUser.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{currentUser.location}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 rounded-3xl border-2 border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-serif">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StaggerContainer stagger={0.1} className="space-y-3">
                      {currentUser.achievements.map((achievement, index) => (
                        <StaggerItem key={index}>
                          <div className="flex items-center space-x-3">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-sm">{achievement}</span>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </CardContent>
                </Card>
              </FadeInUp>
            </div>
          </aside>
        </div>
      </main>

      {/* Profile Image Upload Dialog */}
      <Dialog open={showImageUploadDialog} onOpenChange={setShowImageUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Image</DialogTitle>
            <DialogDescription>
              Choose an image to update your profile picture
            </DialogDescription>
          </DialogHeader>
          <ImageUpload
            onImageSelect={handleImageSelect}
            disabled={isUploadingProfileImage}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowImageUploadDialog(false)
                setSelectedImageFile(null)
              }}
              disabled={isUploadingProfileImage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImageUpload}
              disabled={!selectedImageFile || isUploadingProfileImage}
            >
              {isUploadingProfileImage ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer is Removed */}
    </div>
  )
}