"use client"

import { useState } from "react"
import { signupUser } from "@/lib/api";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, BookOpen, Music, Stethoscope, Zap, CheckCircle, Users } from "lucide-react"
import Link from "next/link"

const communities = [
    {
        id: "student",
        title: "Student",
        description: "Connect with fellow learners and academic peers",
        icon: BookOpen,
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
    },
    {
        id: "teacher",
        title: "Teacher",
        description: "Network with educators and teaching professionals",
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
    },
    {
        id: "musician",
        title: "Musician",
        description: "Join artists and music professionals",
        icon: Music,
        color: "text-purple-600",
        bgColor: "bg-purple-50 border-purple-200",
    },
    {
        id: "doctor",
        title: "Doctor",
        description: "Connect with medical professionals and healthcare workers",
        icon: Stethoscope,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
    },
    {
        id: "dancer",
        title: "Dancer",
        description: "Network with dance professionals and performers",
        icon: Zap,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
    },
]

export default function SignupPage() {
    const [selectedCommunity, setSelectedCommunity] = useState("")
    const [step, setStep] = useState(1)

    const handleContinue = () => {
        if (step === 1 && selectedCommunity) {
            setStep(2)
        }
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Back to Home Link */}
                    <div className="text-center mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>
                        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Join Your Community</h1>
                        <p className="text-muted-foreground">Connect with professionals in your domain</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center space-x-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                >
                                    {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
                                </div>
                                <span className="text-sm font-medium">Choose Community</span>
                            </div>
                            <div className={`w-12 h-0.5 ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
                            <div className={`flex items-center space-x-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                >
                                    2
                                </div>
                                <span className="text-sm font-medium">Create Account</span>
                            </div>
                        </div>
                    </div>

                    <Card className="border-2">
                        {step === 1 ? (
                            <>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-serif">Select Your Professional Community</CardTitle>
                                    <CardDescription>Choose the community that best represents your professional domain</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={selectedCommunity} onValueChange={setSelectedCommunity} className="space-y-4">
                                        {communities.map((community) => (
                                            <div key={community.id} className="relative">
                                                <RadioGroupItem value={community.id} id={community.id} className="peer sr-only" />
                                                <Label
                                                    htmlFor={community.id}
                                                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                                        selectedCommunity === community.id
                                                            ? `${community.bgColor} border-current`
                                                            : "bg-card border-border hover:border-primary/20"
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                            selectedCommunity === community.id ? community.bgColor : "bg-muted"
                                                        }`}
                                                    >
                                                        <community.icon
                                                            className={`w-6 h-6 ${
                                                                selectedCommunity === community.id ? community.color : "text-muted-foreground"
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-serif font-semibold text-lg text-foreground">{community.title}</h3>
                                                        <p className="text-muted-foreground text-sm">{community.description}</p>
                                                    </div>
                                                    {selectedCommunity === community.id && (
                                                        <CheckCircle className={`w-6 h-6 ${community.color}`} />
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <Button className="w-full mt-6" size="lg" onClick={handleContinue} disabled={!selectedCommunity}>
                                        Continue to Account Creation
                                    </Button>
                                </CardContent>
                            </>
                        ) : (
                            <>
                                <CardHeader>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Button variant="ghost" size="sm" onClick={handleBack}>
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                    </div>
                                    <CardTitle className="text-2xl font-serif">Create Your Account</CardTitle>
                                    <CardDescription>
                                        You're joining the{" "}
                                        <span className="font-medium text-primary">
                      {communities.find((c) => c.id === selectedCommunity)?.title}
                    </span>{" "}
                                        community
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" placeholder="Enter your first name" className="bg-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" placeholder="Enter your last name" className="bg-input" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="Enter your email" className="bg-input" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" placeholder="Create a strong password" className="bg-input" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="bg-input"
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={async () => {
                                            try {
                                                const userData = {
                                                    // Combine first and last name into a single 'name' field
                                                    name: (document.getElementById("firstName") as HTMLInputElement).value + " " + (document.getElementById("lastName") as HTMLInputElement).value,
                                                    email: (document.getElementById("email") as HTMLInputElement).value,
                                                    password: (document.getElementById("password") as HTMLInputElement).value,
                                                    // Map 'selectedCommunity' to the 'profession' field
                                                    profession: selectedCommunity,
                                                };

                                                const res = await signupUser(userData);
                                                alert("Account created successfully!");
                                                console.log("Backend Response:", res);
                                            } catch (err) {
                                                console.error("Signup failed:", err);
                                                alert("Signup failed! Check console for details.");
                                            }
                                        }}
                                    >
                                        Create Account
                                    </Button>
                                    <div className="text-center text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                                            Sign in here
                                        </Link>
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>By creating an account, you agree to our</p>
                        <div className="space-x-4">
                            <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                                Terms of Service
                            </Link>
                            <span>•</span>
                            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
