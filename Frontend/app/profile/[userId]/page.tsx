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
  Loader2,
  BookOpen,
  Music,
  Stethoscope,
  Zap
} from "lucide-react"
import Link from "next/link"
import { FadeInUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations"

// --- THEME CONFIG (matching main profile page) ---
const communityIcons = {
  student: BookOpen,
  teacher: Users,
  musician: Music,
  doctor: Stethoscope,
  dancer: Zap,
}

const communityThemes = {
  student: { 
    badge: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400"
  },
  teacher: { 
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    icon: "text-emerald-600 dark:text-emerald-400"
  },
  musician: { 
    badge: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400"
  },
  doctor: { 
    badge: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400"
  },
  dancer: { 
    badge: "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    icon: "text-pink-600 dark:text-pink-400"
  },
}

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

              {/* Profile Info Overlay */}
              <div className="px-6 relative -mt-20">
                <div className="flex flex-col md:flex-row items-end gap-6">
                  
                  {/* BIG AVATAR */}
                  <div className="relative group">
                    <div className="rounded-full bg-white dark:bg-card p-1.5 shadow-sm">
                      <Avatar className="w-48 h-48 border-2 border-gray-100 dark:border-border shadow-inner">
                        <AvatarImage src={profileUser.avatar} alt={profileUser.name} className="object-cover"/>
                        <AvatarFallback className="text-5xl bg-gray-50 dark:bg-muted text-gray-300 dark:text-muted-foreground">{profileUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Community Badge */}
                    <div className={`absolute bottom-4 right-4 p-2.5 rounded-full bg-white dark:bg-card shadow-md border border-gray-100 dark:border-border ${(communityThemes as any)[profileUser.community.toLowerCase()]?.icon || communityThemes.student.icon}`}>
                      {(() => {
                        const CommunityIcon = (communityIcons as any)[profileUser.community.toLowerCase()] || communityIcons.student;
                        return <CommunityIcon className="w-5 h-5" />;
                      })()}
                    </div>
                  </div>

                  {/* Text Info */}
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

          {/* --- MAIN CONTENT GRID --- */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Sidebar */}
            <aside className="space-y-6 lg:col-span-1">
              {/* About / Bio */}
              <FadeInUp delay={0.1}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">About</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {profileUser.bio}
                    </p>
                  </CardContent>
                </Card>
              </FadeInUp>

              {/* Contact Info */}
              <FadeInUp delay={0.2}>
                <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                  <CardHeader className="pb-3 border-b border-gray-50/50 dark:border-border/50">
                    <CardTitle className="text-lg font-semibold text-foreground">Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-muted text-muted-foreground border border-gray-100 dark:border-border">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-muted-foreground truncate">{profileUser.email}</span>
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
            </aside>

            {/* Right Content */}
            <section className="lg:col-span-2 space-y-8">
              <FadeInUp delay={0.2}>
                <div className="w-full space-y-8">
                  {/* Education Grid */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">Education</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "University", value: profileUser.university, icon: GraduationCap },
                        { label: "Major", value: profileUser.major, icon: BookOpen },
                        { label: "Year", value: profileUser.year, icon: Calendar },
                        { label: "GPA", value: profileUser.gpa, icon: Award },
                      ].map((stat, i) => (
                        <Card key={i} className="border border-gray-100 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                            <div className="p-2 rounded-full bg-gray-50 dark:bg-muted text-muted-foreground">
                              <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">{stat.label}</div>
                              <div className="font-bold text-foreground text-sm mt-1 line-clamp-2">{stat.value}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  {profileUser.achievements && profileUser.achievements.length > 0 && (
                    <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                      <CardHeader className="border-b border-gray-50/50 dark:border-border/50 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                          <Award className="w-5 h-5 text-yellow-500" /> 
                          Achievements & Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <StaggerContainer stagger={0.1} className="grid gap-3">
                          {profileUser.achievements.map((achievement, index) => (
                            <StaggerItem key={index}>
                              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50 dark:bg-muted/20 border border-gray-100/50 dark:border-border/40">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                                <span className="text-sm font-medium text-foreground">{achievement}</span>
                              </div>
                            </StaggerItem>
                          ))}
                        </StaggerContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Interests - keeping this as it's useful info */}
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
                </div>
              </FadeInUp>
            </section>

          </div>
        </main>
      </div>
    </PageTransition>
  )
}
