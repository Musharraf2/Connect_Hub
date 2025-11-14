"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import { uploadProfileImage } from "@/lib/api";
import ReactCrop, {
    type Crop,
    centerCrop,
    makeAspectCrop
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

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

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export default function EditProfilePage() {
    const router = useRouter();

    // ----------- State -----------
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [user, setUser] = useState<EditableUser | null>(null);

    const [newSkill, setNewSkill] = useState("");
    const [newInterest, setNewInterest] = useState("");

    const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
    const [showImageUploadDialog, setShowImageUploadDialog] = useState(false)
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("") // For the preview/cropper src
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<Crop>()
    const imgRef = useRef<HTMLImageElement>(null)
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);

    const headerUser = useMemo(
        () =>
            user
                ? { name: user.name, community: user.profession, avatar: user.avatar ?? "/placeholder.svg?height=40&width=40", pendingRequests: user.pendingRequests ?? 0 }
                : { name: "", community: "", avatar: "/placeholder.svg?height=40&width=40", pendingRequests: 0 },
        [user]
    );

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    useEffect(() => {
        return () => {
            if (tempAvatarUrl) {
                URL.revokeObjectURL(tempAvatarUrl);
            }
        }
    }, [tempAvatarUrl])

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
                    avatar: profile.profileImageUrl || "/placeholder.svg?height=120&width=120",
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
        if (!user) {
            toast.error("User data not loaded. Please try again.");
            return;
        }

        setSaving(true);
        const toastId = toast.loading("Saving profile...");

        try {
            let newProfileImageUrl: string | undefined = undefined;

            // 1. --- NEW LOGIC ---
            // Check if there is a new image staged for upload
            if (croppedImageFile) {
                toast.loading("Uploading new profile image...", { id: toastId });

                // Upload the cropped file
                const uploadResult = await uploadProfileImage(user.id, croppedImageFile);
                newProfileImageUrl = uploadResult.profileImageUrl;

                toast.loading("Saving profile data...", { id: toastId });
            }

            // 2. Build the payload with all text fields
            const payload: ProfileUpdatePayload = {
                name: user.name,
                location: user.location,
                aboutMe: user.aboutMe,
                university: user.university,
                major: user.major,
                year: user.year,
                gpa: user.gpa,
                skills: user.skills,
                interests: user.interests,
            };

            // 3. --- NEW LOGIC ---
            // If we uploaded a new image, add its URL to the payload
            if (newProfileImageUrl) {
                payload.profileImageUrl = newProfileImageUrl;
            }

            // 4. Use the imported 'updateProfile' function to save everything
            const updatedUser: UserProfileResponse = await updateProfile(user.id, payload);

            // 5. Update session storage
            const session = sessionStorage.getItem("user");
            const loggedIn = session ? JSON.parse(session) : {};
            // Merge new data (including the new image URL if it exists)
            sessionStorage.setItem("user", JSON.stringify({
                ...loggedIn,
                ...updatedUser,
                profileImageUrl: newProfileImageUrl || user.avatar // Use new URL or existing
            }));

            toast.success("Profile updated!", { id: toastId });
            router.push("/profile");

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Update failed. Please try again.", { id: toastId });
        } finally {
            setSaving(false);

            // 6. --- NEW LOGIC ---
            // Clean up the temporary file and URL
            if (tempAvatarUrl) {
                URL.revokeObjectURL(tempAvatarUrl);
            }
            setTempAvatarUrl(null);
            setCroppedImageFile(null);
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

    // --- ADDED --- (All new handlers for cropping and uploading)

    // Cleans up the image preview URL from memory


    // Triggers when the <img_..> in the cropper loads
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const crop = centerAspectCrop(width, height, 1); // 1 = 1:1 aspect ratio
        setCrop(crop);
        setCompletedCrop(crop);
    }

    // Triggers when you select a file from the <ImageUpload> component
    const handleImageSelect = (file: File) => {
        setSelectedImageFile(file)
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview) // Revoke old URL
        }
        const newPreviewUrl = URL.createObjectURL(file)
        setImagePreview(newPreviewUrl)
    }

    // Helper function to convert the crop data into a real image file
    async function getCroppedImg(
        image: HTMLImageElement,
        crop: Crop,
        fileName: string
    ): Promise<File | null> {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = Math.floor(crop.width * scaleX);
        canvas.height = Math.floor(crop.height * scaleY);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    const file = new File([blob], fileName, { type: blob.type });
                    resolve(file);
                },
                'image/png',
                0.9 // Quality
            );
        });
    }

    // This is the main upload function, now modified to use the cropper
    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current || !selectedImageFile || !user) {
            toast.error("Crop data is missing. Please try again.");
            return
        }

        // Show a quick loading state, as cropping can take a moment
        setIsUploadingProfileImage(true);

        try {
            // 1. Create the cropped file
            const croppedFile = await getCroppedImg(
                imgRef.current,
                completedCrop,
                selectedImageFile.name
            )

            if (!croppedFile) {
                throw new Error("Failed to create cropped image.");
            }

            // 2. Create a temporary URL for the *newly cropped file*
            const newAvatarPreviewUrl = URL.createObjectURL(croppedFile);

            // 3. Clean up any *previous* temporary URL
            if (tempAvatarUrl) {
                URL.revokeObjectURL(tempAvatarUrl);
            }

            // 4. Save the new cropped file and its temporary URL to state
            setCroppedImageFile(croppedFile); // This is staged for the *real* upload
            setTempAvatarUrl(newAvatarPreviewUrl); // This is for the cleanup
            setUser({ ...user, avatar: newAvatarPreviewUrl }); // This updates the <Avatar> preview

            // 5. Reset and close dialog
            setShowImageUploadDialog(false)
            setSelectedImageFile(null)
            setImagePreview("")
            setCrop(undefined)
            setCompletedCrop(undefined)

        } catch (error) {
            console.error("Failed to apply crop", error)
            toast.error("Failed to apply crop");
        } finally {
            setIsUploadingProfileImage(false); // Done with cropping
        }
    }
    // --- END ADDED ---

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
                        <Card className="border-2 border-border/50 shadow-xl">
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowImageUploadDialog(true)}
                                        >
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
                        <Card className="border-2 border-border/50 shadow-xl">
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
                        <Card className="border-2 border-border/50 shadow-xl">
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
                        <Card className="border-2 border-border/50 shadow-xl">
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
                        <Card className="border-2 border-border/50 shadow-xl sticky top-8">
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

                        <Card className="border-2 border-border/50 shadow-xl sticky top-[calc(8rem+24px)]">
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


            {/* ---- ADD THIS DIALOG ---- */}
            <Dialog open={showImageUploadDialog} onOpenChange={setShowImageUploadDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Profile Image</DialogTitle>
                        <DialogDescription>
                            Crop your image to a 1:1 aspect ratio.
                        </DialogDescription>
                    </DialogHeader>

                    {/* This logic shows the <ImageUpload> component OR the cropper */}
                    {!imagePreview ? (
                        // 1. If no image is selected, show the upload box
                        <ImageUpload
                            onImageSelect={handleImageSelect}
                            disabled={isUploadingProfileImage}
                        />
                    ) : (
                        // 2. If an image IS selected, show the cropper
                        <div className="flex flex-col items-center space-y-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1} // Square aspect ratio
                                circularCrop // Makes the cropper UI circular
                                className="max-w-full"
                            >
                                <img
                                    ref={imgRef}
                                    src={imagePreview}
                                    alt="Profile preview"
                                    className="max-h-[60vh] object-contain"
                                    onLoad={onImageLoad}
                                />
                            </ReactCrop>
                            {/* Button to let user pick a different image */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setImagePreview("")
                                    setSelectedImageFile(null)
                                    setCrop(undefined)
                                    if (imagePreview) URL.revokeObjectURL(imagePreview)
                                }}
                                disabled={isUploadingProfileImage}
                            >
                                <X className="h-4 w-4 mr-2" /> Change Image
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowImageUploadDialog(false)
                                // Reset state on cancel
                                if (imagePreview) URL.revokeObjectURL(imagePreview)
                                setImagePreview("")
                                setSelectedImageFile(null)
                                setCrop(undefined)
                                setCompletedCrop(undefined)
                            }}
                            disabled={isUploadingProfileImage}
                        >
                            Cancel
                        </Button>
                        <Button
                            // --- CHANGE THIS ---
                            onClick={handleCropComplete}
                            disabled={!imagePreview || !completedCrop || isUploadingProfileImage}
                        >
                            {/* --- AND CHANGE THIS --- */}
                            {isUploadingProfileImage ? "Applying..." : "Apply Crop"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}