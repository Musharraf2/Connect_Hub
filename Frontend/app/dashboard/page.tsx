"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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
} from "lucide-react"
import Link from "next/link"

// Mock user data - in a real app, this would come from authentication
const currentUser = {
  id: "1",
  name: "Alex Johnson",
  community: "student",
  avatar: "/placeholder.svg?height=40&width=40",
  location: "New York, NY",
  joinDate: "2024",
  connections: 45,
  pendingRequests: 3,
}

// Mock data for community members
const communityMembers = [
  {
    id: "2",
    name: "Sarah Chen",
    community: "student",
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Boston, MA",
    university: "MIT",
    major: "Computer Science",
    year: "Junior",
    mutualConnections: 5,
    status: "none", // none, pending, connected
  },
  {
    id: "3",
    name: "Marcus Williams",
    community: "student",
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Stanford, CA",
    university: "Stanford University",
    major: "Business Administration",
    year: "Senior",
    mutualConnections: 3,
    status: "none",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    community: "student",
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Austin, TX",
    university: "UT Austin",
    major: "Psychology",
    year: "Sophomore",
    mutualConnections: 8,
    status: "pending",
  },
  {
    id: "5",
    name: "David Kim",
    community: "student",
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Seattle, WA",
    university: "University of Washington",
    major: "Engineering",
    year: "Graduate",
    mutualConnections: 2,
    status: "connected",
  },
]

const pendingRequests = [
  {
    id: "6",
    name: "Jessica Park",
    community: "student",
    avatar: "/placeholder.svg?height=50&width=50",
    university: "UCLA",
    major: "Art History",
    mutualConnections: 4,
  },
  {
    id: "7",
    name: "Ryan Thompson",
    community: "student",
    avatar: "/placeholder.svg?height=50&width=50",
    university: "NYU",
    major: "Film Studies",
    mutualConnections: 1,
  },
]

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
  const [members, setMembers] = useState(communityMembers)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSendRequest = (memberId: string) => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, status: "pending" } : member)))
  }

  const handleAcceptRequest = (memberId: string) => {
    // In a real app, this would update the backend
    console.log(`Accepted request from ${memberId}`)
  }

  const handleDeclineRequest = (memberId: string) => {
    // In a real app, this would update the backend
    console.log(`Declined request from ${memberId}`)
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.major.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="text-lg">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="font-serif">{currentUser.name}</CardTitle>
                <CardDescription className="flex items-center justify-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentUser.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-medium">{currentUser.connections}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{currentUser.joinDate}</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/profile">View Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="discover" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="requests" className="relative">
                  Requests
                  {currentUser.pendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {currentUser.pendingRequests}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="connections">My Connections</TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, university, or major..."
                    className="pl-10 bg-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Community Members */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-serif font-bold text-foreground">Discover Fellow Students</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredMembers.map((member) => (
                      <Card key={member.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
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
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{member.location}</span>
                                </div>
                                <div>{member.university}</div>
                                <div className="font-medium">
                                  {member.major} • {member.year}
                                </div>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {member.mutualConnections} mutual connections
                            </span>
                            {member.status === "none" && (
                              <Button size="sm" onClick={() => handleSendRequest(member.id)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            )}
                            {member.status === "pending" && (
                              <Button size="sm" variant="outline" disabled>
                                <Clock className="w-4 h-4 mr-2" />
                                Pending
                              </Button>
                            )}
                            {member.status === "connected" && (
                              <Button size="sm" variant="outline">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">Connection Requests</h2>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.name} />
                              <AvatarFallback>
                                {request.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-serif font-semibold">{request.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {request.university} • {request.major}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {request.mutualConnections} mutual connections
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
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  My Connections ({currentUser.connections})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members
                    .filter((member) => member.status === "connected")
                    .map((connection) => (
                      <Card key={connection.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={connection.avatar || "/placeholder.svg"} alt={connection.name} />
                            <AvatarFallback>
                              {connection.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-serif font-semibold mb-1">{connection.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{connection.university}</p>
                          <Button size="sm" variant="outline" className="w-full bg-transparent">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
