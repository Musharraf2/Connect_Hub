"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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
} from "lucide-react"
import Link from "next/link"

// Mock user data - in a real app, this would come from authentication/API
const currentUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
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
  {
    id: 1,
    type: "connection",
    message: "Connected with Sarah Chen",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "request",
    message: "Received connection request from Marcus Williams",
    time: "1 day ago",
  },
  {
    id: 3,
    type: "message",
    message: "New message from Emily Rodriguez",
    time: "2 days ago",
  },
]

export default function ProfilePage() {
  const CommunityIcon = communityIcons[currentUser.community as keyof typeof communityIcons]
  const communityColorClass = communityColors[currentUser.community as keyof typeof communityColors]

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg"></div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-background mb-4 md:mb-0">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{currentUser.bio}</p>
                  </CardContent>
                </Card>

                {/* Academic Info */}
                <Card>
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

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Interests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="space-y-6">
                  {currentUser.projects.map((project, index) => (
                    <Card key={index}>
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
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-foreground">{activity.message}</p>
                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                <Card>
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <Card>
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

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentUser.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
