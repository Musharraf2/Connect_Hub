"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

// ---- API types & functions you already have in `@/lib/api` ----
import {
    LoginResponse,
    UserProfileResponse,    // should match your Spring User → id,name,email,profession,aboutMe,location
    ProfileUpdatePayload,   // { name?: string; location?: string; aboutMe?: string; }
    getUserProfile,         // (userId: number) => Promise<UserProfileResponse>
    updateProfile,          // (userId: number, payload: ProfileUpdatePayload) => Promise<UserProfileResponse>
} from "@/lib/api";

// ---------- Local helper types used only by this page ----------
type EditableUser = {
    id: number;
    name: string;
    email: string;
    profession: string;
    location: string;
    aboutMe: string;
    // The following are UI-only for now (backend TODO)
    phone?: string;
    university?: string;
    major?: string;
    year?: string;
    gpa?: string;
    skills: string[];
    interests: string[];
    avatar?: string;
    community: string; // for <Header />
    pendingRequests?: number; // for <Header />
};

export default function EditProfilePage() {
    const router = useRouter();

    // ----------- State -----------
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [user, setUser] = useState<EditableUser | null>(null);

    const [newSkill, setNewSkill] = useState("");
    const [newInterest, setNewInterest] = useState("");

    // For Header (falls back to minimal data while fetching)
    const headerUser = useMemo(
        () =>
            user
                ? { name: user.name, community: user.profession, avatar: user.avatar ?? "/placeholder.svg?height=40&width=40", pendingRequests: user.pendingRequests ?? 0 }
                : { name: "", community: "", avatar: "/placeholder.svg?height=40&width=40", pendingRequests: 0 },
        [user]
    );

    // ----------- Bootstrap: read session, fetch profile -----------
    useEffect(() => {
        const session = sessionStorage.getItem("user");
        if (!session) {
            router.push("/login");
            return;
        }

        const loggedIn: LoginResponse = JSON.parse(session); // { id, name, email, profession }
        if (!loggedIn?.id) {
            router.push("/login");
            return;
        }

        (async () => {
            try {
                const profile = await getUserProfile(loggedIn.id);

                // Build the editable object (merge server data + local-only defaults)
                const editable: EditableUser = {
                    id: Number(profile.id),
                    name: profile.name ?? "",
                    email: profile.email ?? "",
                    profession: profile.profession ?? "",
                    location: profile.location ?? "",
                    aboutMe: profile.aboutMe ?? "",
                    // UI-only fields (persist later when backend supports them)
                    university: profile.academicInfo?.university ?? "",
                    major: profile.academicInfo?.major ?? "",
                    year: profile.academicInfo?.year ?? "",
                    gpa: profile.academicInfo?.gpa ?? "",
                    skills: profile.skills.map(s => s.skill),
                    interests: profile.interests.map(i => i.interest),
                    phone: "",
                    avatar: "/placeholder.svg?height=120&width=120",
                    community: profile.profession ?? "",
                    pendingRequests: 0,
                };

                setUser(editable);
            } catch (err) {
                console.error("[edit/profile] fetch error:", err);
                toast.error("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    // ----------- Handlers -----------
    const handleField = (field: keyof EditableUser, value: string) => {
        if (!user) return;
        setUser({ ...user, [field]: value });
    };

    const addSkill = () => {
        if (!user) return;
        const s = newSkill.trim();
        if (!s || user.skills.includes(s)) return;
        setUser({ ...user, skills: [...user.skills, s] });
        setNewSkill("");
    };

    const removeSkill = (s: string) => {
        if (!user) return;
        setUser({ ...user, skills: user.skills.filter((x) => x !== s) });
    };

    const addInterest = () => {
        if (!user) return;
        const i = newInterest.trim();
        if (!i || user.interests.includes(i)) return;
        setUser({ ...user, interests: [...user.interests, i] });
        setNewInterest("");
    };

    const removeInterest = (i: string) => {
        if (!user) return;
        setUser({ ...user, interests: user.interests.filter((x) => x !== i) });
    };

    // --- THIS IS THE CORRECTED HENDLESAVE FUNCTION ---
    const handleSave = async () => {
        // 1. Check if user state is loaded
        if (!user) {
            toast.error("User data not loaded. Please try again.");
            return;
        }

        // 2. Build the payload from the 'user' state
        const payload: ProfileUpdatePayload = {
            name: user.name,
            location: user.location,
            aboutMe: user.aboutMe,
            // Add all the other fields from your state
            university: user.university,
            major: user.major,
            year: user.year,
            gpa: user.gpa,
            skills: user.skills,
            interests: user.interests
        };

        setSaving(true);
        toast.loading("Saving profile...");

        try {
            // 3. Use the imported 'updateProfile' function
            const updatedUser: UserProfileResponse = await updateProfile(user.id, payload);

            // 4. Update session storage with the new data
            sessionStorage.setItem("user", JSON.stringify(updatedUser));

            toast.dismiss();
            toast.success("Profile updated!");
            router.push("/profile"); // Use router to navigate

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.dismiss();
            toast.error("Update failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };
    // --- END OF CORRECTION ---


    if (loading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    // split name into first/last for the UI only
    const firstName = user.name.split(" ")[0] ?? "";
    const lastName = user.name.split(" ").slice(1).join(" ");

    return (
        <div className="min-h-screen bg-background">
            <Header user={headerUser} />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/profile">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Profile
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Edit Profile</h1>
                        <p className="text-muted-foreground">Update your professional information and preferences</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Basic Information</CardTitle>
                                <CardDescription>Your basic profile information visible to other community members</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-6">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                        <AvatarFallback className="text-lg">
                                            {user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline" size="sm" disabled>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Change Photo
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => handleField("name", `${e.target.value} ${lastName}`.trim())}
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => handleField("name", `${firstName} ${e.target.value}`.trim())}
                                            className="bg-input"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={user.email} readOnly className="bg-input" />
                                    {/* If your backend allows updating email, remove readOnly and include it in payload */}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={user.location}
                                        onChange={(e) => handleField("location", e.target.value)}
                                        className="bg-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={user.aboutMe}
                                        onChange={(e) => handleField("aboutMe", e.target.value)}
                                        className="bg-input min-h-[100px]"
                                        placeholder="Tell others about yourself..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Information (UI-only for now) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Academic Information</CardTitle>
                                <CardDescription>Your educational background and current status (not saved yet)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="university">University</Label>
                                        <Input
                                            id="university"
                                            value={user.university ?? ""}
                                            onChange={(e) => handleField("university", e.target.value)}
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="major">Major</Label>
                                        <Input
                                            id="major"
                                            value={user.major ?? ""}
                                            onChange={(e) => handleField("major", e.target.value)}
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year</Label>
                                        <Input
                                            id="year"
                                            value={user.year ?? ""}
                                            onChange={(e) => handleField("year", e.target.value)}
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gpa">GPA</Label>
                                        <Input
                                            id="gpa"
                                            value={user.gpa ?? ""}
                                            onChange={(e) => handleField("gpa", e.target.value)}
                                            className="bg-input"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills (UI-only for now) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Skills</CardTitle>
                                <CardDescription>Add your technical and professional skills (not saved yet)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill, index) => (
                                        <Badge key={`${skill}-${index}`} variant="secondary" className="flex items-center space-x-1">
                                            <span>{skill}</span>
                                            <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive" type="button">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Add a skill..."
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                                        className="bg-input"
                                    />
                                    <Button onClick={addSkill} size="sm" type="button">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interests (UI-only for now) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Interests</CardTitle>
                                <CardDescription>Share your interests (not saved yet)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest, index) => (
                                        <Badge key={`${interest}-${index}`} variant="outline" className="flex items-center space-x-1">
                                            <span>{interest}</span>
                                            <button
                                                onClick={() => removeInterest(interest)}
                                                className="ml-1 hover:text-destructive"
                                                type="button"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Add an interest..."
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addInterest()}
                                        className="bg-input"
                                    />
                                    <Button onClick={addInterest} size="sm" type="button">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Save Changes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button onClick={handleSave} className="w-full" disabled={saving}>
                                    {saving ? "Saving..." : "Save Profile"}
                                </Button>
                                <Button variant="outline" className="w-full bg-transparent" asChild>
                                    <Link href="/profile">Cancel</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Profile Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>• Add a professional photo to increase connection requests</p>
                                <p>• Write a compelling bio that highlights your goals</p>
                                <p>• List relevant skills to help others find you</p>
                                <p>• Keep your academic information up to date</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}