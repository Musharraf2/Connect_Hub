"use client"

import { useState, useEffect } from "react" // Import hooks
import { useRouter } from "next/navigation" // Import router
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Textarea } from "@/components/ui/textarea" 
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
  Save,  // <-- ADDED THIS IMPORT
  X,     // <-- ADDED THIS IMPORT
  Edit3, // <-- ADDED THIS IMPORT
} from "lucide-react"
import Link from "next/link"
import { LoginResponse } from "@/app/login/page" // Import session type
import { motion } from "framer-motion"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations"

// This is our MOCKED data. We will merge session data into this.
const profileMockData = {
  id: "1",
  name: "Mock User",
  email: "mock@email.com",
  phone: "+1 (555) 123-4567",
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
type CurrentUser = typeof profileMockData;

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

const recentActivity = [
  { id: 1, type: "connection", message: "Connected with Sarah Chen", time: "2 hours ago" },
  { id: 2, type: "request", message: "Received connection request from Marcus Williams", time: "1 day ago" },
  { id: 3, type: "message", message: "New message from Emily Rodriguez", time: "2 days ago" },
]

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
      router.push('/login');
    } else {
      const sessionUser: LoginResponse = JSON.parse(userDataString);
      
      // Merge real session data with mock data
      setCurrentUser({
        ...profileMockData, // Start with all the mock data
        name: sessionUser.name,     // Overwrite with real data
        email: sessionUser.email,   // Overwrite with real data
        community: sessionUser.profession, // Overwrite with real data
      });
      
      setAuthLoading(false);
    }
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

  const handleSaveBio = () => {
      setBioText(tempBioText)
      // We would also update the currentUser state if it were fully dynamic
      setIsEditingBio(false)
  }

  const handleCancelBio = () => {
      setTempBioText(bioText)
      setIsEditingBio(false)
  }
  // --- End Bio Edit State ---

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const CommunityIcon = communityIcons[currentUser.community as keyof typeof communityIcons] || Users // Added default icon
  const communityColorClass = communityColors[currentUser.community as keyof typeof communityColors] || "bg-gray-100 text-gray-700 border-gray-200" // Added default color

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <FadeInUp>
          <Card className="mb-8 bg-card/50 rounded-2xl border">
            <div className="relative">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg"></div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                  <Avatar className="w-32 h-32 border-4 border-background mb-4 md:mb-0">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

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
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card className="bg-card/50 rounded-2xl border">
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

                  <Card className="bg-card/50 rounded-2xl border">
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

                  <Card className="bg-card/50 rounded-2xl border">
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

                  <Card className="bg-card/50 rounded-2xl border">
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
                        <Card className="bg-card/50 rounded-2xl border">
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
                  <Card className="bg-card/50 rounded-2xl border">
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

                <TabsContent value="connections" className="space-y-6">
                  <Card className="bg-card/50 rounded-2xl border">
                    <CardHeader>
                      <CardTitle className="font-serif">My Connections ({currentUser.connections})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Your connections will appear here</p>
                        <Button variant="outline" className="mt-4 bg-transparent" asChild>
                          <Link href="/dashboard">Discover People</Link>
                        </Button>
                      </div>
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
                <Card className="bg-card/50 rounded-2xl border">
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

                <Card className="bg-card/50 rounded-2xl border">
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

                <Card className="bg-card/50 rounded-2xl border">
                  <CardHeader>
                    <CardTitle className="font-serif">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <Link href="/profile/edit">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <Link href="/profile/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <Link href="/dashboard">
                        <Users className="w-4 h-4 mr-2" />
                        Find Connections
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </FadeInUp>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer is Removed */}
    </div>
  )
}