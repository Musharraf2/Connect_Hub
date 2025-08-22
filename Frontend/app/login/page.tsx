"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"

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
    const [message, setMessage] = useState("");

    const router = useRouter();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");

        const loginData: LoginRequestType = {
            email,
            password
        };

        try {
            const response: LoginResponse = await loginUser(loginData);

            if (response.profession) {
                // Redirect to the home page, passing all user data in the query parameters
                const params = new URLSearchParams();
                params.set('profession', response.profession);
                params.set('name', response.name);
                params.set('email', response.email);

                router.push(`/home?${params.toString()}`);
            } else {
                setMessage("Invalid email or password!");
            }
        } catch (err: unknown) {
            console.error("Login failed:", err);
            setMessage("Login failed: Check console for details.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>
                        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Sign in to your account</h1>
                        <p className="text-muted-foreground">Welcome back! Please enter your details</p>
                    </div>

                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-2xl font-serif">Sign In</CardTitle>
                            <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="bg-input"
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
                                        className="bg-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" type="submit" size="lg">
                                    Sign In
                                </Button>
                            </form>
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                                    Sign up here
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {message && (
                        <div className="mt-4 text-center text-sm font-medium">
                            <p>{message}</p>
                        </div>
                    )}

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>By signing in, you agree to our</p>
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
    );
}
