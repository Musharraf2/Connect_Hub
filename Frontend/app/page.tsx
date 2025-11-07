"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Users, BookOpen, Music, Stethoscope, Zap, ArrowRight, Star, Shield, Globe, MoveRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion" // <-- Import motion
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations" // <-- Import our new components
import Image from "next/image";


const communities = [
  {
    id: "student",
    title: "Students",
    description: "Connect with fellow learners, share study resources, and build academic networks",
    icon: BookOpen,
    members: "12.5K+",
    color: "bg-blue-100 text-blue-700",
    image: "/diverse-students-library.png",
  },
  {
    id: "teacher",
    title: "Teachers",
    description: "Collaborate with educators, share teaching methods, and inspire each other",
    icon: Users,
    members: "8.2K+",
    color: "bg-green-100 text-green-700",
    image: "/teachers-collaborating.png",
  },
  {
    id: "musician",
    title: "Musicians",
    description: "Jam with fellow artists, share compositions, and grow your musical network",
    icon: Music,
    members: "15.7K+",
    color: "bg-purple-100 text-purple-700",
    image: "/recording-studio-session.png",
  },
  {
    id: "doctor",
    title: "Doctors",
    description: "Network with medical professionals, discuss cases, and advance healthcare",
    icon: Stethoscope,
    members: "6.9K+",
    color: "bg-red-100 text-red-700",
    image: "/placeholder-tzp81.png",
  },
  {
    id: "dancer",
    title: "Dancers",
    description: "Move with the community, share choreography, and celebrate the art of dance",
    icon: Zap,
    members: "9.3K+",
    color: "bg-yellow-100 text-yellow-700",
    image: "/diverse-dancers-studio.png",
  },
]

const features = [
  {
    icon: Shield,
    title: "Domain-Specific Networking",
    description: "Connect only with professionals in your field for meaningful relationships.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Join thousands of professionals worldwide in your specific domain.",
  },
  {
    icon: Star,
    title: "Verified Profiles",
    description: "All members are verified to ensure authentic professional connections.",
  },
]

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (userDataString) {
      router.push('/home');
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4 overflow-hidden"> {/* Added overflow-hidden */}
        <div className="container mx-auto text-center max-w-4xl">
          <FadeInUp>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
              Connect, Collaborate, <span className="text-primary">Create</span>
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Join a professional community tailored to your domain. Network with students, teachers, musicians, doctors,
              and dancers who share your passion and expertise.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.4} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                Join Your Community
                <MoveRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </FadeInUp>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/50 overflow-hidden" id="features">
        <div className="container mx-auto max-w-6xl">
          <FadeInUp className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Why Choose ConnectHub?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience networking designed for professionals who understand your journey.
            </p>
          </FadeInUp>
          <StaggerContainer stagger={0.1} className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <Card className="bg-card/50 h-full"> {/* Added h-full */}
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-serif">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Communities Showcase */}
      <section className="py-24 px-4 overflow-hidden" id="communities">
        <div className="container mx-auto max-w-7xl">
          <FadeInUp className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Find Your Professional Community</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each community is designed specifically for your profession, ensuring meaningful connections.
            </p>
          </FadeInUp>

          <StaggerContainer stagger={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communities.map((community) => (
              <StaggerItem key={community.id}>
                {/* Wrapped Card in motion.div for hover animation */}
                <motion.div
                  whileHover={{ y: -8 }} // Lifts card on hover
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-full"
                >
                  <Card
                    className="group overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out border-2 hover:border-primary/20"
                  >
                    <CardHeader className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={community.image || "/placeholder.svg"}
                          alt={`${community.title} community`}
                          fill
                          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                          priority={false}
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className={`${community.color} border border-black/10`}>
                            {community.members} members
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 flex flex-col flex-1"> {/* Added flex classes */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <community.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-serif">{community.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed mb-6 flex-1"> {/* Changed h-20 to flex-1 */}
                        {community.description}
                      </CardDescription>
                      <Button variant="outline" className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 ease-in-out" asChild>
                        <Link href="/signup">
                          Join {community.title}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <FadeIn>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 md:p-16 text-center">
              <h2 className="text-4xl font-serif font-bold mb-6">Ready to Connect with Your Community?</h2>
              <p className="text-xl mb-10 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals who are already building meaningful connections in their domains.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/signup">
                    Get Started Today
                    <MoveRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}