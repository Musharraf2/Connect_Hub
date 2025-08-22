import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Users, BookOpen, Music, Stethoscope, Zap, ArrowRight, Star, Shield, Globe } from "lucide-react"

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
    description: "Connect only with professionals in your field for meaningful relationships",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Join thousands of professionals worldwide in your domain",
  },
  {
    icon: Star,
    title: "Verified Profiles",
    description: "All members are verified to ensure authentic professional connections",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Connect, Collaborate, <span className="text-primary">Create</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join a professional community tailored to your domain. Network with students, teachers, musicians, doctors,
            and dancers who share your passion and expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Explore Communities
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30" id="about">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Why Choose ConnectHub?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience networking designed for professionals who understand your journey
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities Showcase */}
      <section className="py-20 px-4" id="communities">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Find Your Professional Community</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each community is designed specifically for your profession, ensuring meaningful connections and relevant
              opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communities.map((community) => (
              <Card
                key={community.id}
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-4">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={community.image || "/placeholder.svg"}
                      alt={`${community.title} community`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={community.color}>{community.members} members</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <community.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-serif">{community.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">{community.description}</CardDescription>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    Join {community.title}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-serif font-bold mb-6">Ready to Connect with Your Community?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who are already building meaningful connections in their domains.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              View All Communities
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
