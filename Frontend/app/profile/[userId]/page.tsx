"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserProfile, getUnreadMessageCount, sendConnectionRequest } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import {
  MapPin,
  Calendar,
  Users,
  Mail,
  Phone,
  Award,
  GraduationCap,
  UserPlus,
  MessageCircle,
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { FadeInUp, PageTransition } from "@/components/animations"

type UserProfile = {
  id: number
  name: string
  email: string
  phone: string
  phoneNumber: string
  profession: string
  community: string
  avatar: string
  coverImage?: string
  location: string
  joinDate: string
  bio: string
  university: string
  major: string
  year: string
  gpa: string
  skills: string[]
  interests: string[]
  achievements: string[]
  connections: number
}

type CurrentUser = {
  id: number
  name: string
  avatar: string
  community: string
  unreadMessageCount?: number
  unreadNotificationCount?: number
}

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("http")) return url
  return `http://localhost:8080${url}`
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.userId ? parseInt(params.userId as string) : null

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDataString = sessionStorage.getItem("user")
        if (!userDataString) {
          router.push("/login")
          return
        }

        const userData = JSON.parse(userDataString)
        
        // Fetch unread counts
        const [messageCount] = await Promise.all([
          getUnreadMessageCount(userData.id).catch(() => 0)
        ])

        setCurrentUser({
          id: userData.id,
          name: userData.name,
          avatar: "/placeholder.svg",
          community: userData.profession,
          unreadMessageCount: messageCount
        })

        if (userId) {
          // Fetch the profile user's data
          const profile = await getUserProfile(userId)
          
          setProfileUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            profession: profile.profession,
            community: profile.profession,
            location: profile.location ?? "Location not set",
            bio: profile.aboutMe ?? "No bio available",
            avatar: getImageUrl(profile.profileImageUrl),
            coverImage: getImageUrl(profile.coverImageUrl),
            phoneNumber: profile.phoneNumber ?? "Not provided",
            phone: profile.phoneNumber ?? "Not provided",
            joinDate: "Member since 2024",
            university: profile.academicInfo?.university ?? "N/A",
            major: profile.academicInfo?.major ?? "N/A",
            year: profile.academicInfo?.year ?? "N/A",
            gpa: profile.academicInfo?.gpa ?? "N/A",
            skills: profile.skills.map(s => s.skill),
            interests: profile.interests.map(i => i.interest),
            achievements: profile.achievements ?? [],
            connections: profile.connectionsCount ?? 0
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId, router])

  const handleSendConnectionRequest = async () => {
    if (!currentUser || !profileUser) return
    
    setSendingRequest(true)
    try {
      await sendConnectionRequest(currentUser.id, profileUser.id)
      toast.success(`Connection request sent to ${profileUser.name}`)
    } catch (error) {
      toast.error("Failed to send connection request")
    } finally {
      setSendingRequest(false)
    }
  }

  if (loading || !profileUser || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors duration-300">
        <Header user={currentUser} />

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Hero Section */}
          <FadeInUp>
            <div className="relative mb-10">
              {/* Cover Image */}
              <div className="h-64 w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800 relative overflow-hidden border border-gray-200 dark:border-border">
                {profileUser.coverImage && profileUser.coverImage !== "/placeholder.svg" ? (
                  <img src={profileUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                )}
              </div>

              {/* Profile Info */}
              <div className="px-6 relative -mt-20">
                <div className="flex flex-col md:flex-row items-end gap-6">
                  <div className="relative group">
                    <div className="rounded-full bg-white dark:bg-card p-1.5 shadow-sm">
                      <Avatar className="w-48 h-48 border-2 border-gray-100 dark:border-border shadow-inner">
                        <AvatarImage src={profileUser.avatar} />
                        <AvatarFallback className="text-5xl bg-gray-100 dark:bg-muted">{profileUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="flex-1 pb-2 w-full md:w-auto text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground tracking-tight">{profileUser.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-gray-600 dark:text-muted-foreground">
                          <span className="font-medium text-lg text-foreground">{profileUser.profession.charAt(0).toUpperCase() + profileUser.profession.slice(1)}</span>
                          <span className="text-gray-300 dark:text-gray-700 hidden md:inline">•</span>
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" /> {profileUser.location}
                          </span>
                          <span className="text-gray-300 dark:text-gray-700 hidden md:inline">•</span>
                          <span className="flex items-center gap-1 text-sm">
                            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="font-semibold text-gray-900 dark:text-foreground">{profileUser.connections}</span> connections
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-3 mt-2 md:mt-0">
                        <Button 
                          onClick={handleSendConnectionRequest}
                          disabled={sendingRequest}
                          className="rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {sendingRequest ? "Sending..." : "Connect"}
                        </Button>
                        <Button variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Content Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-6">
              {/* About */}
              <FadeInUp delay={0.1}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">About</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{profileUser.bio}</p>
                  </CardContent>
                </Card>
              </FadeInUp>

              {/* Contact Info */}
              <FadeInUp delay={0.2}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-muted text-muted-foreground border border-gray-100 dark:border-border">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-muted-foreground break-all">{profileUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-muted text-muted-foreground border border-gray-100 dark:border-border">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-muted-foreground">{profileUser.phoneNumber}</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeInUp>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Skills */}
              <FadeInUp delay={0.3}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-gray-100 dark:bg-muted text-foreground hover:bg-gray-200 dark:hover:bg-muted/80 border-transparent font-normal px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInUp>

              {/* Interests */}
              <FadeInUp delay={0.4}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">Interests</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {profileUser.interests.map((interest, i) => (
                        <Badge key={i} variant="outline" className="border-gray-200 dark:border-border text-foreground hover:bg-gray-50 dark:hover:bg-muted font-normal px-3 py-1">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInUp>

              {/* Achievements */}
              {profileUser.achievements && profileUser.achievements.length > 0 && (
                <FadeInUp delay={0.5}>
                  <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                    <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        {profileUser.achievements.map((achievement, i) => (
                          <Badge key={i} className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 font-normal px-3 py-1">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeInUp>
              )}

              {/* Education */}
              <FadeInUp delay={0.6}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">University</p>
                        <p className="text-sm font-medium text-foreground">{profileUser.university}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Major</p>
                        <p className="text-sm font-medium text-foreground">{profileUser.major}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Year</p>
                        <p className="text-sm font-medium text-foreground">{profileUser.year}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">GPA</p>
                        <p className="text-sm font-medium text-foreground">{profileUser.gpa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInUp>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
