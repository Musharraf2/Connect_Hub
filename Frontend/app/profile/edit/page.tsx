"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save, Loader2, Plus } from "lucide-react";
import { Header } from "@/components/header";
// Footer removed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

import {
    LoginResponse,
    UserProfileResponse,
    ProfileUpdatePayload,
    getUserProfile,
    updateProfile,
    uploadProfileImage,
    uploadCoverImage,
} from "@/lib/api";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import ReactCrop, {
    type Crop,
    centerCrop,
    makeAspectCrop
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { FadeInUp } from "@/components/animations";

// ---------- Local helper types ----------
type EditableUser = {
    id: number;
    name: string;
    email: string;
    profession: string;
    location: string;
    aboutMe: string;
    university?: string;
    major?: string;
    year?: string;
    gpa?: string;
    skills: string[];
    interests: string[];
    achievements: string[];
    avatar?: string;
    coverImage?: string;
    phoneNumber?: string;
    community: string;
    pendingRequests?: number;
};

// --- URL HELPER ---
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
};

// --- CROP HELPERS ---
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

async function getCroppedImg(image: HTMLImageElement, crop: Crop, fileName: string): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas is empty')); return; }
            const file = new File([blob], fileName, { type: blob.type });
            resolve(file);
        }, 'image/jpeg', 0.9);
    });
}

export default function EditProfilePage() {
    const router = useRouter();

    // ----------- State -----------
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<EditableUser | null>(null);

    // Skills & Interests & Achievements
    const [newSkill, setNewSkill] = useState("");
    const [newInterest, setNewInterest] = useState("");
    const [newAchievement, setNewAchievement] = useState("");

    // Image Upload State (Profile)
    const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
    const [showImageUploadDialog, setShowImageUploadDialog] = useState(false)
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<Crop>()
    const imgRef = useRef<HTMLImageElement>(null)
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);

    // Cover Image Upload State
    const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false)
    const [showCoverImageUploadDialog, setShowCoverImageUploadDialog] = useState(false)
    const [selectedCoverImageFile, setSelectedCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string>("")
    const [coverCrop, setCoverCrop] = useState<Crop>()
    const [completedCoverCrop, setCompletedCoverCrop] = useState<Crop>()
    const coverImgRef = useRef<HTMLImageElement>(null)
    const [croppedCoverImageFile, setCroppedCoverImageFile] = useState<File | null>(null);
    const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);

    const headerUser = useMemo(() => user ? { 
        name: user.name, 
        community: user.profession, 
        avatar: user.avatar ?? "/placeholder.svg", 
        pendingRequests: user.pendingRequests ?? 0 
    } : undefined, [user]);

    // Clean up object URLs
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            if (tempAvatarUrl) URL.revokeObjectURL(tempAvatarUrl);
            if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
            if (tempCoverUrl) URL.revokeObjectURL(tempCoverUrl);
        }
    }, [imagePreview, tempAvatarUrl, coverImagePreview, tempCoverUrl]);

    // ----------- Bootstrap -----------
    useEffect(() => {
        const session = sessionStorage.getItem("user");
        if (!session) {
            router.push("/login");
            return;
        }

        const loggedIn: LoginResponse = JSON.parse(session);
        if (!loggedIn?.id) {
            router.push("/login");
            return;
        }

        (async () => {
            try {
                const profile = await getUserProfile(loggedIn.id);
                setUser({
                    id: Number(profile.id),
                    name: profile.name ?? "",
                    email: profile.email ?? "",
                    profession: profile.profession ?? "",
                    location: profile.location ?? "",
                    aboutMe: profile.aboutMe ?? "",
                    university: profile.academicInfo?.university ?? "",
                    major: profile.academicInfo?.major ?? "",
                    year: profile.academicInfo?.year ?? "",
                    gpa: profile.academicInfo?.gpa ?? "",
                    skills: profile.skills.map(s => s.skill),
                    interests: profile.interests.map(i => i.interest),
                    achievements: profile.achievements ?? [],
                    avatar: getImageUrl(profile.profileImageUrl),
                    coverImage: getImageUrl(profile.coverImageUrl),
                    phoneNumber: profile.phoneNumber ?? "",
                    community: profile.profession ?? "",
                    pendingRequests: 0,
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
                toast.error("Could not load profile.");
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

    const addAchievement = () => {
        if (!user) return;
        const a = newAchievement.trim();
        if (!a || user.achievements.includes(a)) return;
        setUser({ ...user, achievements: [...user.achievements, a] });
        setNewAchievement("");
    };

    const removeAchievement = (a: string) => {
        if (!user) return;
        setUser({ ...user, achievements: user.achievements.filter((x) => x !== a) });
    };

    // ----------- Save Logic (Sanitized) -----------

const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const toastId = toast.loading("Saving profile...");

    try {
        let newProfileImageUrl: string | undefined = undefined;
        let newCoverImageUrl: string | undefined = undefined;

        // 1. Upload new profile image if exists
        if (croppedImageFile) {
            toast.loading("Uploading profile image...", { id: toastId });
            const uploadResult = await uploadProfileImage(user.id, croppedImageFile);
            newProfileImageUrl = uploadResult.profileImageUrl;
        }

        // 2. Upload new cover image if exists
        if (croppedCoverImageFile) {
            toast.loading("Uploading cover image...", { id: toastId });
            const uploadResult = await uploadCoverImage(user.id, croppedCoverImageFile);
            newCoverImageUrl = uploadResult.coverImageUrl;
        }

        // 3. Update text fields - SANITIZATION STEP
        toast.loading("Updating details...", { id: toastId });

        // Helper to convert empty strings to undefined (so backend ignores them instead of crashing)
        const clean = (val: string | undefined) => (val === "" || val === null ? undefined : val);

        const payload: ProfileUpdatePayload = {
            name: clean(user.name),
            location: clean(user.location),
            aboutMe: clean(user.aboutMe),
            phoneNumber: clean(user.phoneNumber),
            university: clean(user.university),
            major: clean(user.major),
            year: clean(user.year),
            gpa: clean(user.gpa), // This fixes the "" vs Number issue
            skills: user.skills,
            interests: user.interests,
            achievements: user.achievements,
        };

        if (newProfileImageUrl) {
            payload.profileImageUrl = newProfileImageUrl;
        }
        if (newCoverImageUrl) {
            payload.coverImageUrl = newCoverImageUrl;
        }

        console.log("Sending Payload:", payload); // Debug: See exactly what is being sent

        const updatedUser = await updateProfile(user.id, payload);

        // 3. Update Session
        const session = sessionStorage.getItem("user");
        const loggedIn = session ? JSON.parse(session) : {};
        sessionStorage.setItem("user", JSON.stringify({
            ...loggedIn,
            ...updatedUser,
            profileImageUrl: newProfileImageUrl || user.avatar
        }));

        toast.success("Profile saved!", { id: toastId });
        router.push("/profile"); 

    } catch (error: any) {
        console.error("Error updating:", error);
        // Fallback error message if the backend sends ""
        const errorMessage = error.message && error.message.length > 0 
            ? error.message 
            : "Server rejected the data (Check GPA/Year format)";
        toast.error(errorMessage, { id: toastId });
    } finally {
        setSaving(false);
        setCroppedImageFile(null);
        setCroppedCoverImageFile(null);
    }
};
    // ----------- Image Handlers -----------
    const handleImageSelect = (file: File) => {
        setSelectedImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(file));
    }

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
        setCompletedCrop(centerAspectCrop(width, height, 1));
    }

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current || !selectedImageFile || !user) return;
        setIsUploadingProfileImage(true);
        try {
            const file = await getCroppedImg(imgRef.current, completedCrop, selectedImageFile.name);
            if (file) {
                setCroppedImageFile(file);
                const url = URL.createObjectURL(file);
                if (tempAvatarUrl) URL.revokeObjectURL(tempAvatarUrl);
                setTempAvatarUrl(url);
                setUser({ ...user, avatar: url });
                setShowImageUploadDialog(false);
                
                // Cleanup
                setImagePreview("");
                setSelectedImageFile(null);
            }
        } catch (e) {
            toast.error("Failed to crop image");
        } finally {
            setIsUploadingProfileImage(false);
        }
    }

    // ----------- Cover Image Handlers -----------
    const handleCoverImageSelect = (file: File) => {
        setSelectedCoverImageFile(file);
        if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
        setCoverImagePreview(URL.createObjectURL(file));
    }

    const onCoverImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const aspectRatio = 16 / 9; // Wide aspect for cover
        setCoverCrop(centerAspectCrop(width, height, aspectRatio));
        setCompletedCoverCrop(centerAspectCrop(width, height, aspectRatio));
    }

    const handleCoverCropComplete = async () => {
        if (!completedCoverCrop || !coverImgRef.current || !selectedCoverImageFile || !user) return;
        setIsUploadingCoverImage(true);
        try {
            const file = await getCroppedImg(coverImgRef.current, completedCoverCrop, selectedCoverImageFile.name);
            if (file) {
                setCroppedCoverImageFile(file);
                const url = URL.createObjectURL(file);
                if (tempCoverUrl) URL.revokeObjectURL(tempCoverUrl);
                setTempCoverUrl(url);
                setUser({ ...user, coverImage: url });
                setShowCoverImageUploadDialog(false);
                
                // Cleanup
                setCoverImagePreview("");
                setSelectedCoverImageFile(null);
            }
        } catch (e) {
            toast.error("Failed to crop cover image");
        } finally {
            setIsUploadingCoverImage(false);
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors duration-300">
            <Header user={headerUser} />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                            <Link href="/profile">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Profile
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">Edit Profile</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Cover Image */}
                        <FadeInUp delay={0.05}>
                            <Card className="border border-gray-200 dark:border-border shadow-sm bg-white dark:bg-card overflow-hidden">
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800">
                                    {user.coverImage && user.coverImage !== "/placeholder.svg" ? (
                                        <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No cover image</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 right-4">
                                        <Button 
                                            size="sm" 
                                            onClick={() => setShowCoverImageUploadDialog(true)}
                                            className="bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-gray-900 dark:text-white shadow-lg"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {user.coverImage && user.coverImage !== "/placeholder.svg" ? "Change Cover" : "Add Cover"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </FadeInUp>

                        {/* Basic Info */}
                        <FadeInUp delay={0.1}>
                            <Card className="border border-gray-200 dark:border-border shadow-sm bg-white dark:bg-card">
                                <CardHeader className="border-b border-gray-100 dark:border-border/50 pb-4">
                                    <CardTitle className="text-lg font-semibold text-foreground">Basic Information</CardTitle>
                                    <CardDescription>This is how others will see you on the platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="w-24 h-24 border-2 border-gray-100 dark:border-border">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Button variant="outline" size="sm" onClick={() => setShowImageUploadDialog(true)} className="bg-white dark:bg-card border-gray-200 dark:border-border">
                                                <Upload className="w-4 h-4 mr-2" /> Change Photo
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-2">JPG or PNG. 1:1 Ratio recommended.</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={user.name} onChange={(e) => handleField("name", e.target.value)} className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input id="location" value={user.location} onChange={(e) => handleField("location", e.target.value)} className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input 
                                            id="phoneNumber" 
                                            value={user.phoneNumber} 
                                            onChange={(e) => handleField("phoneNumber", e.target.value)} 
                                            className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted" 
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea 
                                            id="bio" 
                                            value={user.aboutMe} 
                                            onChange={(e) => handleField("aboutMe", e.target.value)} 
                                            className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted min-h-[120px]" 
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeInUp>

                        {/* Academic Info */}
                        <FadeInUp delay={0.2}>
                            <Card className="border border-gray-200 dark:border-border shadow-sm bg-white dark:bg-card">
                                <CardHeader className="border-b border-gray-100 dark:border-border/50 pb-4">
                                    <CardTitle className="text-lg font-semibold text-foreground">Academic Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>University</Label>
                                            <Input value={user.university} onChange={(e) => handleField("university", e.target.value)} className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Major</Label>
                                            <Input value={user.major} onChange={(e) => handleField("major", e.target.value)} className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Year</Label>
                                            <Input value={user.year} onChange={(e) => handleField("year", e.target.value)} className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>GPA</Label>
                                            <Input value={user.gpa} onChange={(e) => handleField("gpa", e.target.value)} className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeInUp>

                        {/* Skills & Interests */}
                        <FadeInUp delay={0.3}>
                            <Card className="border border-gray-200 dark:border-border shadow-sm bg-white dark:bg-card">
                                <CardHeader className="border-b border-gray-100 dark:border-border/50 pb-4">
                                    <CardTitle className="text-lg font-semibold text-foreground">Skills & Interests</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <Label>Skills</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {user.skills.map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="bg-gray-100 dark:bg-muted text-foreground hover:bg-gray-200 dark:hover:bg-muted/80 px-3 py-1 font-normal">
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={newSkill} 
                                                onChange={(e) => setNewSkill(e.target.value)} 
                                                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                                                placeholder="Add a skill (e.g., Python)" 
                                                className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border"
                                            />
                                            <Button onClick={addSkill} size="icon" variant="outline" className="shrink-0"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Interests</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {user.interests.map((interest, i) => (
                                                <Badge key={i} variant="outline" className="border-gray-200 dark:border-border text-muted-foreground px-3 py-1 font-normal">
                                                    {interest}
                                                    <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={newInterest} 
                                                onChange={(e) => setNewInterest(e.target.value)} 
                                                onKeyDown={(e) => e.key === "Enter" && addInterest()}
                                                placeholder="Add an interest (e.g., AI)" 
                                                className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border"
                                            />
                                            <Button onClick={addInterest} size="icon" variant="outline" className="shrink-0"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Achievements & Certifications</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {user.achievements.map((achievement, i) => (
                                                <Badge key={i} variant="secondary" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 px-3 py-1 font-normal">
                                                    {achievement}
                                                    <button onClick={() => removeAchievement(achievement)} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={newAchievement} 
                                                onChange={(e) => setNewAchievement(e.target.value)} 
                                                onKeyDown={(e) => e.key === "Enter" && addAchievement()}
                                                placeholder="Add an achievement (e.g., Dean's List 2023)" 
                                                className="bg-gray-50 dark:bg-muted/50 border-gray-200 dark:border-border"
                                            />
                                            <Button onClick={addAchievement} size="icon" variant="outline" className="shrink-0"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeInUp>
                    </div>

                    {/* Right Sidebar - Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <FadeInUp delay={0.2}>
                                <Card className="border border-gray-200 dark:border-border shadow-sm bg-white dark:bg-card">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-semibold text-foreground">Publish Changes</CardTitle>
                                        <CardDescription>Save your updates to your public profile.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-4">
                                        <Button onClick={handleSave} disabled={saving} className="w-full bg-gray-900 dark:bg-primary hover:bg-gray-800 dark:hover:bg-primary/90 text-white dark:text-primary-foreground shadow-sm">
                                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            {saving ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button variant="outline" asChild className="w-full border-gray-200 dark:border-border text-muted-foreground hover:text-foreground">
                                            <Link href="/profile">Cancel</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </FadeInUp>

                            <FadeInUp delay={0.3}>
                                <Card className="border border-gray-200 dark:border-border shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-400">Profile Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-blue-600/80 dark:text-blue-300/80 space-y-2">
                                        <p>• Keep your bio concise and friendly.</p>
                                        <p>• List at least 5 skills to get better recommendations.</p>
                                        <p>• Use a clear, professional photo.</p>
                                    </CardContent>
                                </Card>
                            </FadeInUp>
                        </div>
                    </div>
                </div>
            </main>

             {/* Image Upload Dialog */}
             <Dialog open={showImageUploadDialog} onOpenChange={setShowImageUploadDialog}>
                <DialogContent className="max-w-md bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <DialogHeader>
                        <DialogTitle>Upload Profile Photo</DialogTitle>
                        <DialogDescription>Choose an image to crop and set as your avatar.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {!imagePreview ? (
                            <ImageUpload 
                                onImageSelect={handleImageSelect} 
                                disabled={isUploadingProfileImage}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-gray-100 dark:bg-muted p-4 rounded-lg w-full flex justify-center">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, p) => setCrop(p)}
                                        onComplete={c => setCompletedCrop(c)}
                                        aspect={1}
                                        circularCrop
                                        className="max-h-[50vh]"
                                    >
                                        <img ref={imgRef} src={imagePreview} onLoad={onImageLoad} alt="Crop" className="max-w-full" />
                                    </ReactCrop>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setImagePreview("");
                                    setSelectedImageFile(null);
                                }}>
                                    Choose Different Image
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowImageUploadDialog(false)}>Cancel</Button>
                        <Button onClick={handleCropComplete} disabled={!completedCrop || isUploadingProfileImage}>
                            {isUploadingProfileImage ? "Saving..." : "Apply & Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cover Image Upload Dialog */}
            <Dialog open={showCoverImageUploadDialog} onOpenChange={setShowCoverImageUploadDialog}>
                <DialogContent className="max-w-2xl bg-white dark:bg-card border border-gray-200 dark:border-border">
                    <DialogHeader>
                        <DialogTitle>Upload Cover Image</DialogTitle>
                        <DialogDescription>Choose an image to crop and set as your cover photo (16:9 ratio recommended).</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {!coverImagePreview ? (
                            <ImageUpload 
                                onImageSelect={handleCoverImageSelect} 
                                disabled={isUploadingCoverImage}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-gray-100 dark:bg-muted p-4 rounded-lg w-full flex justify-center">
                                    <ReactCrop
                                        crop={coverCrop}
                                        onChange={(_, p) => setCoverCrop(p)}
                                        onComplete={c => setCompletedCoverCrop(c)}
                                        aspect={16/9}
                                        className="max-h-[50vh]"
                                    >
                                        <img ref={coverImgRef} src={coverImagePreview} onLoad={onCoverImageLoad} alt="Crop Cover" className="max-w-full" />
                                    </ReactCrop>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setCoverImagePreview("");
                                    setSelectedCoverImageFile(null);
                                }}>
                                    Choose Different Image
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowCoverImageUploadDialog(false)}>Cancel</Button>
                        <Button onClick={handleCoverCropComplete} disabled={!completedCoverCrop || isUploadingCoverImage}>
                            {isUploadingCoverImage ? "Saving..." : "Apply & Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}