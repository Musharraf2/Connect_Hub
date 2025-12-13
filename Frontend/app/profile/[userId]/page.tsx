"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserProfile, getUnreadMessageCount, sendConnectionRequest, getPostsByUserId, updatePost, deletePost, toggleLike, addComment, getAcceptedConnections, type PostResponse } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
  Zap,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  MessageSquare,
  Briefcase,
  Building,
  Clock,
  Check
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
  professionalDetails?: any // Parsed JSON object for profession-specific fields
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

// Icon mapping for common field types
const getIconForField = (fieldKey: string) => {
  const key = fieldKey.toLowerCase()
  if (key.includes('hospital') || key.includes('clinic') || key.includes('company') || key.includes('organization') || key.includes('institution') || key.includes('school') || key.includes('studio')) return Building
  if (key.includes('experience') || key.includes('years')) return Clock
  if (key.includes('specialization') || key.includes('specialty') || key.includes('subject') || key.includes('genre') || key.includes('style') || key.includes('type')) return Briefcase
  if (key.includes('license') || key.includes('certification') || key.includes('award') || key.includes('achievement')) return Award
  if (key.includes('university') || key.includes('college') || key.includes('education')) return GraduationCap
  if (key.includes('major') || key.includes('degree') || key.includes('course')) return BookOpen
  if (key.includes('year') || key.includes('date')) return Calendar
  if (key.includes('skill') || key.includes('expertise')) return Zap
  if (key.includes('location') || key.includes('address')) return MapPin
  if (key.includes('phone') || key.includes('contact')) return Phone
  if (key.includes('email')) return Mail
  return Briefcase // Default icon
}

// Format field label for display (convert camelCase/snake_case to Title Case)
const formatFieldLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim()
}

// Helper function to get profession-specific fields dynamically
const getProfessionFields = (profession: string, profileUser: UserProfile) => {
  const professionLower = profession.toLowerCase()
  
  // For students, always show academic info
  if (professionLower === 'student') {
    return [
      { label: "University", value: profileUser.university, icon: GraduationCap },
      { label: "Major", value: profileUser.major, icon: BookOpen },
      { label: "Year", value: profileUser.year, icon: Calendar },
      { label: "GPA", value: profileUser.gpa, icon: Award },
    ]
  }
  
  // For all other professions, dynamically build fields from professionalDetails
  const fields: { label: string; value: string; icon: any }[] = []
  
  if (profileUser.professionalDetails && typeof profileUser.professionalDetails === 'object') {
    // Convert professionalDetails object to array of field objects
    Object.entries(profileUser.professionalDetails).forEach(([key, value]) => {
      if (value && value !== 'N/A' && value !== '') {
        fields.push({
          label: formatFieldLabel(key),
          value: String(value),
          icon: getIconForField(key)
        })
      }
    })
  }
  
  // If no professional details, show generic placeholder fields
  if (fields.length === 0) {
    return [
      { label: "Organization", value: "N/A", icon: Building },
      { label: "Specialization", value: "N/A", icon: Briefcase },
      { label: "Experience", value: "N/A", icon: Clock },
      { label: "Certification", value: "N/A", icon: Award },
    ]
  }
  
  // Limit to 4 most important fields for clean UI
  return fields.slice(0, 4)
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.userId ? parseInt(params.userId as string) : null

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [editingPost, setEditingPost] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<number | null>(null)
  const [commentingOnPost, setCommentingOnPost] = useState<number | null>(null)
  const [commentText, setCommentText] = useState("")
  const [isConnected, setIsConnected] = useState(false)

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
            connections: profile.connectionsCount ?? 0,
            professionalDetails: profile.professionalDetails ? JSON.parse(profile.professionalDetails) : null
          })

          // Check if users are connected
          try {
            const connections = await getAcceptedConnections(userData.id)
            const connected = connections.some(conn => 
              (conn.requester.id === userData.id && conn.receiver.id === userId) ||
              (conn.receiver.id === userData.id && conn.requester.id === userId)
            )
            setIsConnected(connected)
          } catch (error) {
            console.error("Error checking connection status:", error)
          }

          // Fetch user posts
          setPostsLoading(true)
          try {
            const userPosts = await getPostsByUserId(userId, userData.id)
            setPosts(userPosts)
          } catch (error) {
            console.error("Error loading posts:", error)
          } finally {
            setPostsLoading(false)
          }
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

  const handleEditPost = (post: PostResponse) => {
    setEditingPost(post.id)
    setEditContent(post.content)
  }

  const handleSaveEdit = async () => {
    if (!editingPost || !currentUser) return
    
    try {
      const updated = await updatePost(editingPost, currentUser.id, editContent)
      setPosts(posts.map(p => p.id === editingPost ? updated : p))
      setEditingPost(null)
      setEditContent("")
      toast.success("Post updated successfully")
    } catch (error) {
      toast.error("Failed to update post")
    }
  }

  const handleDeletePost = async () => {
    if (!postToDelete || !currentUser) return
    
    try {
      await deletePost(postToDelete, currentUser.id)
      setPosts(posts.filter(p => p.id !== postToDelete))
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      toast.success("Post deleted successfully")
    } catch (error) {
      toast.error("Failed to delete post")
    }
  }

  const handleToggleLike = async (postId: number) => {
    if (!currentUser) return
    
    try {
      const updated = await toggleLike(postId, currentUser.id)
      setPosts(posts.map(p => p.id === postId ? updated : p))
    } catch (error) {
      toast.error("Failed to like post")
    }
  }

  const handleAddComment = async (postId: number) => {
    if (!currentUser || !commentText.trim()) return
    
    try {
      const updated = await addComment(postId, { content: commentText, userId: currentUser.id })
      setPosts(posts.map(p => p.id === postId ? updated : p))
      setCommentText("")
      setCommentingOnPost(null)
      toast.success("Comment added")
    } catch (error) {
      toast.error("Failed to add comment")
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
                        {isConnected ? (
                          <Button 
                            disabled
                            variant="outline"
                            className="rounded-full shadow-sm border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Connected
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleSendConnectionRequest}
                            disabled={sendingRequest}
                            className="rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {sendingRequest ? "Sending..." : "Connect"}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                          onClick={() => router.push(`/messages?userId=${profileUser.id}`)}
                        >
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
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="w-full justify-start mb-6">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>

                  {/* Timeline Tab - User's Posts */}
                  <TabsContent value="timeline">
                    <div className="space-y-4">
                      {postsLoading ? (
                        <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card p-8 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </Card>
                      ) : posts.length === 0 ? (
                        <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card p-8 text-center">
                          <p className="text-muted-foreground">No posts yet.</p>
                        </Card>
                      ) : (
                        posts.map((post) => {
                          const isOwn = currentUser?.id === post.user.id
                          return (
                            <Card key={post.id} className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex gap-3">
                                    <Link href={`/profile/${post.user.id}`}>
                                      <Avatar className="w-10 h-10 border border-border cursor-pointer hover:opacity-80 transition-opacity">
                                        <AvatarImage src={getImageUrl(post.user.profileImageUrl)} />
                                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    </Link>
                                    <div>
                                      <Link href={`/profile/${post.user.id}`}>
                                        <h3 className="font-semibold text-sm text-card-foreground hover:underline cursor-pointer">
                                          {post.user.name}
                                        </h3>
                                      </Link>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {post.user.profession}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  {isOwn && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          variant="destructive"
                                          onClick={() => {
                                            setPostToDelete(post.id)
                                            setDeleteDialogOpen(true)
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mb-3">
                                  {post.content}
                                </p>

                                {post.imageUrl && (
                                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border border-border mb-3">
                                    <Image
                                      src={getImageUrl(post.imageUrl)}
                                      alt="Post content"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`gap-2 hover:bg-red-500/10 transition-all active:scale-95 ${
                                      post.likedByCurrentUser
                                        ? "text-red-500 hover:text-red-600"
                                        : "text-muted-foreground"
                                    }`}
                                    onClick={() => handleToggleLike(post.id)}
                                  >
                                    <Heart
                                      className={`w-4 h-4 transition-transform ${
                                        post.likedByCurrentUser
                                          ? "fill-current scale-110"
                                          : ""
                                      }`}
                                    />
                                    <span className="text-xs font-medium">
                                      {post.likesCount || "Like"}
                                    </span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-all active:scale-95"
                                    onClick={() =>
                                      setCommentingOnPost(
                                        commentingOnPost === post.id ? null : post.id
                                      )
                                    }
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-xs font-medium">
                                      {post.commentsCount || "Comment"}
                                    </span>
                                  </Button>
                                </div>

                                {post.comments.length > 0 && (
                                  <div className="bg-muted/50 rounded-xl p-3 mt-3 space-y-3 border border-border">
                                    {post.comments.map((c) => (
                                      <div key={c.id} className="flex gap-2 text-sm">
                                        <Avatar className="w-6 h-6 mt-1">
                                          <AvatarImage src={getImageUrl(c.user.profileImageUrl)} />
                                          <AvatarFallback className="text-[10px]">
                                            {c.user.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-card p-2 px-3 rounded-lg shadow-sm border border-border flex-1">
                                          <span className="font-semibold text-card-foreground text-xs block mb-0.5">
                                            {c.user.name}
                                          </span>
                                          <span className="text-foreground">
                                            {c.content}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {commentingOnPost === post.id && (
                                  <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={currentUser.avatar} />
                                    </Avatar>
                                    <div className="flex-1 flex gap-2">
                                      <Textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="min-h-[40px] h-[40px] py-2 resize-none text-sm bg-card border-border text-foreground"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddComment(post.id)}
                                        className="h-[40px]"
                                      >
                                        Post
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </TabsContent>

                  {/* About Tab - Dynamic Professional Details */}
                  <TabsContent value="about">
                    <div className="w-full space-y-8">
                      {/* Professional Information Grid - Dynamic based on profession */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-foreground">
                            {profileUser.profession === 'student' ? 'Education' : 'Professional Information'}
                          </h3>
                          <Badge variant="outline" className="capitalize">
                            {profileUser.profession}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {getProfessionFields(profileUser.profession, profileUser).map((stat, i) => (
                            <Card key={i} className="group border border-gray-200 dark:border-border bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/50 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                  <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="w-full">
                                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{stat.label}</div>
                                  <div className="font-bold text-foreground text-base leading-tight break-words">{stat.value}</div>
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

                      {/* Interests */}
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
                  </TabsContent>
                </Tabs>
              </FadeInUp>
            </section>

          </div>
        </main>

        {/* Edit Post Dialog */}
        <Dialog open={editingPost !== null} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Make changes to your post below.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px] resize-none"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPost(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePost}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
