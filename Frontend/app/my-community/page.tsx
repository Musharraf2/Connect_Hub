"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserPlus, UserCheck, Clock, MapPin, Users, GraduationCap, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock current user data
const currentUser = {
  id: "1",
  name: "Alex Johnson",
  community: "student",
  avatar: "/placeholder.svg?height=40&width=40",
  location: "New York, NY",
  university: "Columbia University",
  major: "Computer Science",
  year: "Senior",
}

// Mock data for all community members
const allCommunityMembers = [
  {
    id: "2",
    name: "Sarah Chen",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Boston, MA",
    university: "MIT",
    major: "Computer Science",
    year: "Junior",
    mutualConnections: 5,
    status: "none",
    lastActive: "2 hours ago",
    bio: "AI enthusiast and hackathon winner. Love building innovative solutions!",
    joinDate: "2023",
  },
  {
    id: "3",
    name: "Marcus Williams",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Stanford, CA",
    university: "Stanford University",
    major: "Business Administration",
    year: "Senior",
    mutualConnections: 3,
    status: "connected",
    lastActive: "1 day ago",
    bio: "Future entrepreneur passionate about sustainable business practices.",
    joinDate: "2022",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Austin, TX",
    university: "UT Austin",
    major: "Psychology",
    year: "Sophomore",
    mutualConnections: 8,
    status: "pending_received",
    lastActive: "30 minutes ago",
    bio: "Studying human behavior and mental health advocacy.",
    joinDate: "2024",
  },
  {
    id: "5",
    name: "David Kim",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Seattle, WA",
    university: "University of Washington",
    major: "Engineering",
    year: "Graduate",
    mutualConnections: 2,
    status: "none",
    lastActive: "5 hours ago",
    bio: "Robotics researcher working on autonomous systems.",
    joinDate: "2021",
  },
  {
    id: "6",
    name: "Jessica Park",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Los Angeles, CA",
    university: "UCLA",
    major: "Art History",
    year: "Junior",
    mutualConnections: 4,
    status: "pending_sent",
    lastActive: "1 hour ago",
    bio: "Art curator in training, passionate about contemporary art.",
    joinDate: "2023",
  },
  {
    id: "7",
    name: "Michael Thompson",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Chicago, IL",
    university: "Northwestern University",
    major: "Journalism",
    year: "Senior",
    mutualConnections: 6,
    status: "none",
    lastActive: "3 hours ago",
    bio: "Investigative journalist covering tech and social issues.",
    joinDate: "2022",
  },
  {
    id: "8",
    name: "Priya Patel",
    community: "student",
    avatar: "/placeholder.svg?height=80&width=80",
    location: "Philadelphia, PA",
    university: "University of Pennsylvania",
    major: "Medicine",
    year: "Graduate",
    mutualConnections: 7,
    status: "none",
    lastActive: "45 minutes ago",
    bio: "Medical student specializing in pediatric care.",
    joinDate: "2020",
  },
]

export default function MyCommunityPage() {
  const [members, setMembers] = useState(allCommunityMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleSendRequest = (memberId: string) => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, status: "pending_sent" } : member)))
  }

  const handleAcceptRequest = (memberId: string) => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, status: "connected" } : member)))
  }

  const handleDeclineRequest = (memberId: string) => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, status: "none" } : member)))
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.major.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    if (filterStatus === "connected") return matchesSearch && member.status === "connected"
    if (filterStatus === "pending")
      return matchesSearch && (member.status === "pending_sent" || member.status === "pending_received")
    if (filterStatus === "available") return matchesSearch && member.status === "none"

    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Connected
          </Badge>
        )
      case "pending_sent":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Request Sent
          </Badge>
        )
      case "pending_received":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Request Received
          </Badge>
        )
      default:
        return null
    }
  }

  const getActionButton = (member: any) => {
    switch (member.status) {
      case "connected":
        return (
          <Button size="sm" variant="outline" className="bg-transparent">
            <UserCheck className="w-4 h-4 mr-2" />
            Connected
          </Button>
        )
      case "pending_sent":
        return (
          <Button size="sm" variant="outline" disabled className="bg-transparent">
            <Clock className="w-4 h-4 mr-2" />
            Request Sent
          </Button>
        )
      case "pending_received":
        return (
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => handleAcceptRequest(member.id)}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeclineRequest(member.id)}
              className="bg-transparent"
            >
              Decline
            </Button>
          </div>
        )
      default:
        return (
          <Button size="sm" onClick={() => handleSendRequest(member.id)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Connect
          </Button>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">My Community</h1>
              <p className="text-muted-foreground">Connect with fellow students in your network</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, university, or major..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={filterStatus !== "all" ? "bg-transparent" : ""}
              >
                All ({members.length})
              </Button>
              <Button
                variant={filterStatus === "connected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("connected")}
                className={filterStatus !== "connected" ? "bg-transparent" : ""}
              >
                Connected ({members.filter((m) => m.status === "connected").length})
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
                className={filterStatus !== "pending" ? "bg-transparent" : ""}
              >
                Pending ({members.filter((m) => m.status === "pending_sent" || m.status === "pending_received").length})
              </Button>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback className="text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute top-0 right-0">{getStatusBadge(member.status)}</div>
                </div>
                <CardTitle className="font-serif text-lg">{member.name}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">{member.university}</span>
                  </div>
                  <div className="text-sm">
                    {member.major} • {member.year}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{member.location}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">{member.bio}</p>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{member.mutualConnections} mutual connections</span>
                  <span>Joined {member.joinDate}</span>
                </div>

                <div className="flex items-center justify-center space-x-1 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Active {member.lastActive}</span>
                </div>

                <div className="pt-2">{getActionButton(member)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">No members found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more community members.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
