"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getUserProfile,
  UserProfileResponse,
  getUnreadMessageCount,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import {
  MapPin,
  Calendar,
  Users,
  BookOpen,
  Music,
  Stethoscope,
  Zap,
  Mail,
  Phone,
  Award,
  GraduationCap,
  Edit3,
} from "lucide-react"
import Link from "next/link"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations"

// --- MOCK DATA ---
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
      description: "An AI-powered study companion that helps students organize their learning paths using NLP.",
      tech: ["Python", "TensorFlow", "React"],
      link: "#",
      github: "#"
    },
    {
      title: "Campus Connect",
      description: "A social platform for university students to find study groups and local events.",
      tech: ["Node.js", "MongoDB", "React Native"],
      link: "#",
      github: "#"
    },
    {
        title: "Portfolio V2",
        description: "A modern portfolio website built with Next.js and Tailwind CSS.",
        tech: ["Next.js", "Tailwind", "Framer Motion"],
        link: "#",
        github: "#"
      },
  ],
}

// --- TYPES ---
type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  phoneNumber: string;
  profession: string;
  community: string;
  avatar: string;
  coverImage?: string;
  location: string;
  joinDate: string;
  connections: number;
  pendingRequests: number;
  unreadMessageCount?: number;
  bio: string;
  university: string;
  major: string;
  year: string;
  gpa: string;
  skills: string[];
  interests: string[];
  achievements: string[];
  projects: { title: string; description: string; tech: string[]; link?: string; github?: string }[];
};

// --- THEME CONFIG ---
const communityIcons = {
  student: BookOpen,
  teacher: Users,
  musician: Music,
  doctor: Stethoscope,
  dancer: Zap,
}

// Themes adapted for Light and Dark modes
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
    badge: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    icon: "text-rose-600 dark:text-rose-400"
  },
  dancer: { 
    badge: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400"
  },
}

const recentActivity = [
  { id: 1, type: "connection", message: "Connected with Sarah Chen", time: "2 hours ago" },
  { id: 2, type: "request", message: "Received connection request from Marcus Williams", time: "1 day ago" },
  { id: 3, type: "message", message: "New message from Emily Rodriguez", time: "2 days ago" },
]

// --- URL HELPER ---
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
};

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
      router.push('/login');
      return;
    }

    const sessionUser: UserProfileResponse = JSON.parse(userDataString);
    if (!sessionUser?.id) {
        router.push('/login');
        return;
    }

    (async () => {
      try {
        const profile = await getUserProfile(sessionUser.id);
        const unreadCount = await getUnreadMessageCount(sessionUser.id);
        
        const mergedUser = {
          ...profileMockData, 
          id: profile.id,
          name: profile.name,
          email: profile.email,
          profession: profile.profession,
          community: profile.profession,
          location: profile.location ?? "Location not set",
          bio: profile.aboutMe ?? "No bio yet. Click edit to tell your story.",
          avatar: getImageUrl(profile.profileImageUrl),
          coverImage: getImageUrl(profile.coverImageUrl),
          phoneNumber: profile.phoneNumber ?? "+1 (555) 000-0000",
          
          university: profile.academicInfo?.university ?? "N/A",
          major: profile.academicInfo?.major ?? "N/A",
          year: profile.academicInfo?.year ?? "N/A",
          gpa: profile.academicInfo?.gpa ?? "N/A",

          skills: profile.skills.map(s => s.skill),
          interests: profile.interests.map(i => i.interest),
          achievements: profile.achievements ?? [],

          connections: profile.connectionsCount ?? 0,
          pendingRequests: profile.pendingRequestsCount ?? 0,
          unreadMessageCount: unreadCount,
        };

        setCurrentUser(mergedUser);

      } catch (error) {
        console.error("Failed to fetch profile", error);
        toast.error("Could not load profile.");
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [router]);

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const commKey = currentUser.community.toLowerCase() as keyof typeof communityThemes;
  const theme = communityThemes[commKey] || communityThemes.student;
  const CommunityIcon = communityIcons[commKey as keyof typeof communityIcons] || Users;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors duration-300">
      <Header user={currentUser} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* --- HERO SECTION --- */}
        <FadeInUp>
          <div className="relative mb-10">
            {/* Cover Image */}
            <div className="h-64 w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800 relative overflow-hidden border border-gray-200 dark:border-border">
                {currentUser.coverImage && currentUser.coverImage !== "/placeholder.svg" ? (
                    <img src={currentUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    /* Optional pattern overlay for no image */
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
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover"/>
                            <AvatarFallback className="text-5xl bg-gray-50 dark:bg-muted text-gray-300 dark:text-muted-foreground">{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Community Badge */}
                    <div className={`absolute bottom-4 right-4 p-2.5 rounded-full bg-white dark:bg-card shadow-md border border-gray-100 dark:border-border ${theme.icon}`}>
                        <CommunityIcon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Text Info */}
                  <div className="flex-1 pb-2 w-full md:w-auto text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground tracking-tight">{currentUser.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-gray-600 dark:text-muted-foreground">
                                <span className="font-medium text-lg text-foreground">{currentUser.profession.charAt(0).toUpperCase() + currentUser.profession.slice(1)}</span>
                                <span className="text-gray-300 dark:text-gray-700 hidden md:inline">•</span>
                                <span className="flex items-center gap-1 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" /> {currentUser.location}
                                </span>
                                <span className="text-gray-300 dark:text-gray-700 hidden md:inline">•</span>
                                <span className="flex items-center gap-1 text-sm">
                                    <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" /> 
                                    <span className="font-semibold text-gray-900 dark:text-foreground">{currentUser.connections}</span> connections
                                </span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 mt-2 md:mt-0">
                             <Button asChild variant="outline" className="rounded-full border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-muted hover:text-foreground bg-white dark:bg-card text-foreground shadow-sm">
                                <Link href="/profile/edit">
                                    <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                                </Link>
                            </Button>
                            <Button className="rounded-full shadow-sm bg-gray-900 hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground">
                                Share Profile
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
                            {currentUser.bio}
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
                            <span className="text-muted-foreground truncate">{currentUser.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-md bg-gray-50 dark:bg-muted text-muted-foreground border border-gray-100 dark:border-border">
                                <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-muted-foreground">{currentUser.phoneNumber}</span>
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
                            {currentUser.skills.map((skill, i) => (
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
                                        { label: "University", value: currentUser.university, icon: GraduationCap },
                                        { label: "Major", value: currentUser.major, icon: BookOpen },
                                        { label: "Year", value: currentUser.year, icon: Calendar },
                                        { label: "GPA", value: currentUser.gpa, icon: Award },
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
                            <Card className="border border-gray-100 dark:border-border shadow-sm bg-white dark:bg-card">
                                <CardHeader className="border-b border-gray-50/50 dark:border-border/50 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                        <Award className="w-5 h-5 text-yellow-500" /> 
                                        Achievements & Certifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <StaggerContainer stagger={0.1} className="grid gap-3">
                                        {currentUser.achievements.map((achievement, index) => (
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
                        </div>
                    </FadeInUp>
          </section>

        </div>
      </main>
    </div>
  )
}