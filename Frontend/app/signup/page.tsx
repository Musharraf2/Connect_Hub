"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { signupUser } from "@/lib/api";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
// We no longer need RadioGroup or the community icons
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// List of professions for the dropdown
const PROFESSIONS = [
    "Student",
    "Doctor",
    "Singer",
    "Teacher",
    "Engineer",
    "Lawyer",
    "Architect",
    "Chef",
    "Police Officer",
    "Firefighter",
    "Pilot",
    "Nurse",
    "Farmer",
    "Actor",
    "Photographer",
    "Writer",
    "Journalist",
    "Scientist",
    "Fashion Designer",
    "Software Developer",
    "Electrician",
    "Mechanic",
    "Accountant",
    "Pharmacist",
    "Social Worker",
    "Plumber",
    "Graphic Designer",
    "Entrepreneur",
    "Dancer",
    "Athlete"
].map(profession => ({
    value: profession.toLowerCase().replace(/\s+/g, '-'),
    label: profession
}))

export default function SignupPage() {
    // We no longer need 'step' or 'selectedCommunity'
    const router = useRouter()
    const [profession, setProfession] = useState<string>("")

    return (
        <div className="min-h-screen flex">
            {/* Left Panel (Visual) - Hidden on mobile */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-12 flex-col justify-between">
                <div>
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-serif font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ConnectHub</span>
                    </Link>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-left"
                >
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Join your community.</h1>
                    <p className="text-lg text-muted-foreground">Start connecting with thousands of professionals in your field today.</p>
                </motion.div>
                <div className="text-sm text-muted-foreground">
                    © 2024 ConnectHub. All rights reserved.
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12">
                {/* Back to Home Link (FOR MOBILE ONLY) */}
                <Link
                    href="/"
                    className="inline-flex md:hidden items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>

                <div className="w-full max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        {/* We no longer need the step indicator */}
                        
                        <Card className="border-2 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-3xl font-serif text-center">
                                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create</span> Your Account
                                </CardTitle>
                                <CardDescription className="text-center">
                                    Join your professional community
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

                                {/* --- THIS IS THE NEW FIELD --- */}
                                <div className="space-y-2">
                                    <Label htmlFor="profession">Your Profession</Label>
                                    <Combobox
                                        options={PROFESSIONS}
                                        value={profession}
                                        onValueChange={setProfession}
                                        placeholder="Select your profession..."
                                        searchPlaceholder="Search profession..."
                                        emptyText="No profession found."
                                        className="bg-input"
                                    />
                                </div>
                                {/* --- END OF NEW FIELD --- */}

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
                                            // Find the selected profession label from the value
                                            const selectedProfession = PROFESSIONS.find(p => p.value === profession)?.label || "";
                                            
                                            const userData = {
                                                name: (document.getElementById("firstName") as HTMLInputElement).value + " " + (document.getElementById("lastName") as HTMLInputElement).value,
                                                email: (document.getElementById("email") as HTMLInputElement).value,
                                                // Get profession from the state
                                                profession: selectedProfession,
                                                password: (document.getElementById("password") as HTMLInputElement).value,
                                            };
                                            
                                            if (!userData.name.trim() || !userData.email || !userData.password || !userData.profession) {
                                                toast.error("Please fill in all fields.");
                                                return;
                                            }

                                            // Add password confirmation check
                                            const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value;
                                            if (userData.password !== confirmPassword) {
                                                toast.error("Passwords do not match.");
                                                return;
                                            }

                                            const responseMessage = await signupUser(userData);

                                            if (responseMessage.includes("successfully")) {
                                                toast.success("Account created successfully!");
                                                router.push('/login');
                                            } else {
                                                toast.error(responseMessage);
                                            }
                                        } catch (err) {
                                            console.error("Signup failed:", err);
                                            toast.error("Signup failed! The server might be down.");
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
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}