"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { loginUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users } from "lucide-react"
import { motion } from "framer-motion"

// Define the type for the login request data.
export interface LoginRequestType {
    email: string;
    password: string;
}

// Define the type for the login response data from the backend.
export interface LoginResponse {
    name: string;
    email: string;
    profession: string;
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const loginData: LoginRequestType = {
            email,
            password
        };

        try {
            const response: LoginResponse = await loginUser(loginData);

            if (response.profession) {
                toast.success("Login successful! Redirecting...");
                
                sessionStorage.setItem('user', JSON.stringify(response));
                router.push('/home');
            } else {
                toast.error("Invalid email or password!");
            }
        } catch (err: unknown) {
            console.error("Login failed:", err);
            toast.error("Login failed. The server may be down.");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel (Visual) - Hidden on mobile */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/5 to-background p-12 flex-col justify-between">
                <div>
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-serif font-bold text-foreground">ConnectHub</span>
                    </Link>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-left"
                >
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Welcome Back.</h1>
                    <p className="text-lg text-muted-foreground">Sign in to reconnect with your professional community.</p>
                </motion.div>
                <div className="text-sm text-muted-foreground">
                    © 2024 ConnectHub. All rights reserved.
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12">
                {/* Back to Home Link (FOR MOBILE ONLY) - Position fixed */}
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
                        <div className="text-left mb-10">
                            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Sign in to your account</h1>
                            <p className="text-muted-foreground">Welcome back! Please enter your details.</p>
                        </div>
                    
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-input text-base py-6"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="bg-input text-base py-6"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button className="w-full text-base" type="submit" size="lg">
                                Sign In
                            </Button>
                        </form>
                        <div className="text-center text-sm text-muted-foreground mt-6">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                                Sign up here
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}