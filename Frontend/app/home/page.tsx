"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

// Icons
import { 
    UserPlus, MapPin, Edit3, Save, X, Heart, MessageSquare, 
    Trash2, Image as ImageIcon, Smile, Send, Loader2
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/header";
import { ImageUpload } from "@/components/image-upload";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FadeInUp, StaggerContainer } from "@/components/animations";

// API Imports
import {
    getUsersByProfession,
    LoginResponse,
    Connection,
    sendConnectionRequest,
    getSentPendingRequests,
    cancelConnectionRequest,
    getPendingRequests,
    getAcceptedConnections,
    UserProfileDetailResponse,
    PostResponse,
    createPost,
    getPostsByProfession,
    deletePost,
    toggleLike,
    addComment,
    uploadPostImage,
    updateProfile,
    UserProfileResponse,
    getUnreadMessageCount
} from "@/lib/api";

// Cropping
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// Emoji
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

// ---------------- Types ----------------
interface CurrentUser {
    id?: number;
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
    unreadMessageCount?: number;
}

interface ProfileData {
    name: string;
    email: string;
    profession: string;
    location: string;
    connections: number;
    bio: string;
}

// --- URL HELPER ---
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
};

// ---------------- Helper Functions for Crop ----------------
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

export default function HomePage() {
    const router = useRouter();
    
    // Data State
    const [members, setMembers] = useState<UserProfileResponse[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
    const [sentPendingRequests, setSentPendingRequests] = useState<Connection[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [posts, setPosts] = useState<PostResponse[]>([]);

    // Loading State
    const [membersLoading, setMembersLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);

    // Action State
    const [postContent, setPostContent] = useState("");
    const [postImageFile, setPostImageFile] = useState<File | null>(null);
    const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
    const [isPostingDialogOpen, setIsPostingDialogOpen] = useState(false);
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [commentingOnPost, setCommentingOnPost] = useState<number | null>(null);
    const [commentText, setCommentText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [localSentRequests, setLocalSentRequests] = useState<number[]>([]); // For instant UI updates on connect

    // Cropping & Bio
    const [isCroppingDialogOpen, setIsCroppingDialogOpen] = useState(false);
    const [tempImageFile, setTempImageFile] = useState<File | null>(null);
    const [tempImagePreview, setTempImagePreview] = useState<string>("");
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const imgRef = useRef<HTMLImageElement>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState("");
    const [tempBioText, setTempBioText] = useState("");

    // --- Bootstrap ---
    useEffect(() => {
        const userDataString = sessionStorage.getItem("user");
        if (!userDataString) {
            router.push("/login");
            return;
        }

        try {
            const user: LoginResponse = JSON.parse(userDataString);
            setCurrentUser({
                id: user.id,
                name: user.name,
                community: user.profession,
                avatar: "/placeholder.svg",
                pendingRequests: 0,
            });

            const loadAllData = async () => {
                try {
                    await fetchUserProfile(user.id);
                    await Promise.all([
                        fetchMembers(user.profession),
                        fetchPendingRequests(user.id),
                        fetchSentPendingRequests(user.id),
                        fetchAcceptedConnections(user.id),
                        fetchPosts(user.profession, user.id),
                        fetchUnreadMessageCount(user.id)
                    ]);
                } catch (err) {
                    console.error("Failed data fetch", err);
                } finally {
                    setAuthLoading(false);
                }
            };
            loadAllData();
        } catch (error) {
            sessionStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        return () => {
            if (postImagePreview) URL.revokeObjectURL(postImagePreview);
            if (tempImagePreview) URL.revokeObjectURL(tempImagePreview);
        };
    }, [postImagePreview, tempImagePreview]);

    // --- Data Fetchers ---
    const fetchUserProfile = async (userId: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}`);
            if (!res.ok) throw new Error("Failed");
            const data: UserProfileDetailResponse = await res.json();
            setCurrentUser((prev) => (prev ? { ...prev, avatar: getImageUrl(data.profileImageUrl) } : null));
            setProfileData({
                name: data.name,
                email: data.email,
                profession: data.profession,
                location: data.location || "Not set",
                connections: connections.length,
                bio: data.aboutMe || "No bio yet."
            });
            setBioText(data.aboutMe || "No bio yet.");
            setTempBioText(data.aboutMe || "No bio yet.");
        } catch (error) { console.error(error); }
    };

    const fetchMembers = async (profession: string) => {
        try {
            const all = await getUsersByProfession(profession);
            const sVal = sessionStorage.getItem("user");
            if (sVal) {
                const cu: LoginResponse = JSON.parse(sVal);
                setMembers(all.filter((m) => m.id !== cu.id));
            } else setMembers(all);
        } catch (err: any) { console.error(err); } 
        finally { setMembersLoading(false); }
    };

    const fetchPendingRequests = async (userId: number) => {
        const reqs = await getPendingRequests(userId);
        setPendingRequests(reqs);
        setCurrentUser((prev) => (prev ? { ...prev, pendingRequests: reqs.length } : null));
    };

    const fetchSentPendingRequests = async (userId: number) => {
        const reqs = await getSentPendingRequests(userId);
        setSentPendingRequests(reqs);
    };

    const fetchAcceptedConnections = async (userId: number) => {
        const conns = await getAcceptedConnections(userId);
        setConnections(conns);
        setProfileData((prev) => (prev ? { ...prev, connections: conns.length } : null));
    };

    const fetchPosts = async (profession: string, userId: number) => {
        // Note: We intentionally don't set loading to true here for background refreshes
        // to prevent UI flickering
        try {
            const p = await getPostsByProfession(profession, userId);
            setPosts(p);
        } catch (e) { console.error(e); } 
        finally { setPostsLoading(false); }
    };

    const fetchUnreadMessageCount = async (userId: number) => {
        try {
            const count = await getUnreadMessageCount(userId);
            setCurrentUser((prev) => (prev ? { ...prev, unreadMessageCount: count } : null));
        } catch (e) { console.error(e); }
    };

    // --- Handlers ---
    const handleImageSelect = (file: File) => {
        if (tempImagePreview) URL.revokeObjectURL(tempImagePreview);
        const url = URL.createObjectURL(file);
        setTempImageFile(file);
        setTempImagePreview(url);
        setIsCroppingDialogOpen(true);
    };

    const handleApplyCrop = async () => {
        if (!completedCrop || !imgRef.current || !tempImageFile) return;
        try {
            const croppedFile = await getCroppedImg(imgRef.current, completedCrop, tempImageFile.name);
            if (croppedFile) {
                setPostImageFile(croppedFile);
                if (postImagePreview) URL.revokeObjectURL(postImagePreview);
                setPostImagePreview(URL.createObjectURL(croppedFile));
                setIsCroppingDialogOpen(false);
                setTempImageFile(null);
                setTempImagePreview("");
            }
        } catch (e) { toast.error("Crop failed"); }
    };

    const handleRemovePostImage = () => {
        setPostImageFile(null);
        if (postImagePreview) URL.revokeObjectURL(postImagePreview);
        setPostImagePreview(null);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setPostContent((prev) => prev + emojiData.emoji);
    };

    // --- POST CREATION (Auto Refresh Fix) ---
    const handleCreatePost = async () => {
        if (!postContent.trim() && !postImageFile) {
            toast.error("Add text or image"); return;
        }
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return;
        const user: LoginResponse = JSON.parse(sVal);
        
        setIsSubmittingPost(true);
        try {
            const newPost = await createPost({ content: postContent, userId: user.id });
            
            if (postImageFile) {
                await uploadPostImage(newPost.id, postImageFile);
            }

            // REFRESH STRATEGY:
            // Fetch the entire list again to guarantee the image and timestamps are correct from the server.
            // This ensures the author's avatar and post image appear without a page reload.
            await fetchPosts(user.profession, user.id);
            
            setPostContent("");
            handleRemovePostImage();
            setIsPostingDialogOpen(false);
            toast.success("Posted!");
        } catch (e) { 
            toast.error("Failed to post"); 
        } finally { 
            setIsSubmittingPost(false); 
        }
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return;
        const user: LoginResponse = JSON.parse(sVal);
        try {
            await deletePost(postToDelete, user.id);
            setPosts(prev => prev.filter(p => p.id !== postToDelete)); // Immediate local update
            setDeleteDialogOpen(false);
            setPostToDelete(null);
            toast.success("Deleted");
        } catch (e) { toast.error("Delete failed"); }
    };

    // --- LIKES (Auto Refresh Fix) ---
    const handleToggleLike = async (postId: number) => {
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return;
        const user: LoginResponse = JSON.parse(sVal);
        try {
            // API returns the updated post object
            const updatedPost = await toggleLike(postId, user.id);
            
            // Replace the old post in our state with the new one from the server
            setPosts(prevPosts => prevPosts.map(p => p.id === postId ? updatedPost : p));
        } catch (e) { console.error(e); }
    };

    // --- COMMENTS (Auto Refresh Fix) ---
    const handleAddComment = async (postId: number) => {
        if (!commentText.trim()) return;
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return;
        const user: LoginResponse = JSON.parse(sVal);
        
        try {
            // API returns the updated post object containing the new comment
            const updatedPost = await addComment(postId, { content: commentText, userId: user.id });
            
            // Replace the old post in our state with the new one.
            // This allows the comment to appear instantly with the correct user avatar.
            setPosts(prevPosts => prevPosts.map(p => p.id === postId ? updatedPost : p));
            
            setCommentText("");
            setCommentingOnPost(null);
            toast.success("Comment added");
        } catch (e) { toast.error("Comment failed"); }
    };

    const getConnectionStatus = (userId: number) => {
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return { status: "none" };
        const cu: LoginResponse = JSON.parse(sVal);
        
        // Check Local Optimistic State (for instant UI feedback)
        if (localSentRequests.includes(userId)) return { status: "pending", connectionId: -1 };

        const sent = sentPendingRequests.find(r => r.requester.id === cu.id && r.receiver.id === userId);
        if (sent) return { status: "pending", connectionId: sent.id };
        
        const connected = connections.some(c => 
            (c.requester.id === cu.id && c.receiver.id === userId) || (c.receiver.id === cu.id && c.requester.id === userId)
        );
        if (connected) return { status: "connected" };

        return { status: "none" };
    };

    // --- CONNECT (Auto Refresh Fix) ---
    const handleSendRequest = async (mid: number) => {
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return;
        const user: LoginResponse = JSON.parse(sVal);
        
        // Optimistic Update: Hide immediately
        setLocalSentRequests(prev => [...prev, mid]);

        try {
            await sendConnectionRequest(user.id, mid);
            // Background Refresh: Get the real state
            await fetchSentPendingRequests(user.id);
            toast.success("Sent");
        } catch (e) {
            toast.error("Failed to send");
            // Revert optimistic update if failed
            setLocalSentRequests(prev => prev.filter(id => id !== mid));
        }
    };

    const handleCancelRequest = async (cid: number) => {
        const sVal = sessionStorage.getItem("user");
        if (!sVal) return;
        const user: LoginResponse = JSON.parse(sVal);
        try {
            await cancelConnectionRequest(cid);
            await fetchSentPendingRequests(user.id);
            toast.success("Canceled");
        } catch (e) {
            toast.error("Failed to cancel");
        }
    };

    const handleSaveBio = async () => {
        const sVal = sessionStorage.getItem('user');
        if (!sVal) return;
        const user = JSON.parse(sVal);
        try {
            const up = await updateProfile(user.id, { aboutMe: tempBioText.trim() });
            setBioText(up.aboutMe ?? "");
            setProfileData(prev => prev ? { ...prev, bio: up.aboutMe ?? "" } : null);
            setIsEditingBio(false);
            toast.success("Bio updated");
        } catch (e) { toast.error("Bio failed"); }
    };

    if (authLoading || !currentUser || !profileData) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Header user={currentUser} />

            <main className="container mx-auto grid lg:grid-cols-4 gap-6 py-8 px-4">
                
                {/* Left Sidebar - User Profile */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <FadeInUp>
                            <Card className="overflow-hidden border-border shadow-sm bg-card hover:shadow-md transition-all duration-200">
                                <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/10"></div>
                                <CardContent className="relative pt-0 pb-6 px-6">
                                    <div className="flex flex-col items-center -mt-10 mb-4">
                                        <Avatar className="w-20 h-20 border-4 border-card shadow-sm">
                                            {/* FIX: Use getImageUrl for current user */}
                                            <AvatarImage src={currentUser.avatar} />
                                            <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-center mt-3">
                                            <h2 className="font-serif text-lg font-bold text-card-foreground">{profileData.name}</h2>
                                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                {profileData.profession}
                                            </p>
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {profileData.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 py-4 border-t border-border">
                                        <div className="text-center p-2 hover:bg-muted rounded-lg transition-colors">
                                            <div className="font-bold text-card-foreground">{profileData.connections}</div>
                                            <div className="text-xs text-muted-foreground font-medium">Connections</div>
                                        </div>
                                        <div className="text-center p-2 hover:bg-muted rounded-lg transition-colors">
                                            <div className="font-bold text-card-foreground">{currentUser.pendingRequests}</div>
                                            <div className="text-xs text-muted-foreground font-medium">Requests</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">About</h4>
                                            {!isEditingBio && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => setIsEditingBio(true)}>
                                                    <Edit3 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                        {isEditingBio ? (
                                            <div className="space-y-2">
                                                <Textarea 
                                                    value={tempBioText} 
                                                    onChange={e => setTempBioText(e.target.value)} 
                                                    className="text-sm min-h-[80px] resize-none bg-muted border-border focus:bg-card text-foreground"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSaveBio}>Save</Button>
                                                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setIsEditingBio(false)}>Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{bioText}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeInUp>
                    </div>
                </aside>

                {/* Middle Section - Feed */}
                <section className="w-full lg:col-span-2 space-y-6">
                    
                    {/* Post Trigger Card */}
                    <FadeInUp delay={0.1}>
                        <Card className="border-border shadow-sm bg-card overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 cursor-pointer hover:opacity-90 transition-opacity">
                                        <AvatarImage src={currentUser.avatar} />
                                        <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={() => setIsPostingDialogOpen(true)}
                                        className="flex-1 text-left bg-muted hover:bg-muted/80 text-muted-foreground text-sm py-3 px-4 rounded-full transition-all duration-200 font-medium border border-transparent hover:border-border"
                                    >
                                        Start a post, {profileData.name.split(" ")[0]}...
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeInUp>

                    {/* Posts Feed */}
                    <div className="space-y-5">
                        <StaggerContainer stagger={0.1}>
                            {posts.map((post) => {
                                const isOwn = currentUser?.id === post.user.id;
                                return (
                                    <Card key={post.id} className="border-border shadow-sm bg-card hover:shadow-md transition-all duration-300 mb-4 overflow-hidden">
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-3">
                                                    <Avatar className="w-10 h-10 border border-border">
                                                        {/* FIX: Use getImageUrl for post author */}
                                                        <AvatarImage src={getImageUrl((post.user as any).profileImageUrl)} />
                                                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold text-sm text-card-foreground hover:underline cursor-pointer">{post.user.name}</h3>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{post.user.profession}</p>
                                                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{new Date(post.createdAt).toLocaleDateString()} • <span className="font-medium">Global</span></p>
                                                    </div>
                                                </div>
                                                {isOwn && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => { setPostToDelete(post.id); setDeleteDialogOpen(true); }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mb-3">{post.content}</p>
                                            
                                            {post.imageUrl && (
                                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                                                    <Image src={post.imageUrl} alt="Post content" fill className="object-cover" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className={`gap-2 hover:bg-red-500/10 transition-colors ${post.likedByCurrentUser ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
                                                    onClick={() => handleToggleLike(post.id)}
                                                >
                                                    <Heart className={`w-4 h-4 ${post.likedByCurrentUser ? "fill-current" : ""}`} />
                                                    <span className="text-xs font-medium">{post.likesCount || "Like"}</span>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="gap-2 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500"
                                                    onClick={() => setCommentingOnPost(commentingOnPost === post.id ? null : post.id)}
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="text-xs font-medium">{post.commentsCount || "Comment"}</span>
                                                </Button>
                                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-muted">
                                                    <Send className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Share</span>
                                                </Button>
                                            </div>

                                            {post.comments.length > 0 && (
                                                <div className="bg-muted/50 rounded-xl p-3 mt-3 space-y-3 border border-border">
                                                    {post.comments.map(c => (
                                                        <div key={c.id} className="flex gap-2 text-sm">
                                                            <Avatar className="w-6 h-6 mt-1">
                                                                {/* FIX: Use getImageUrl for commenter */}
                                                                <AvatarImage src={getImageUrl((c.user as any).profileImageUrl)} />
                                                                <AvatarFallback className="text-[10px]">{c.user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="bg-card p-2 px-3 rounded-lg shadow-sm border border-border flex-1">
                                                                <span className="font-semibold text-card-foreground text-xs block mb-0.5">{c.user.name}</span>
                                                                <span className="text-foreground">{c.content}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {commentingOnPost === post.id && (
                                                <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
                                                    <Avatar className="w-8 h-8"><AvatarImage src={currentUser.avatar} /></Avatar>
                                                    <div className="flex-1 flex gap-2">
                                                        <Textarea 
                                                            value={commentText} 
                                                            onChange={e => setCommentText(e.target.value)} 
                                                            placeholder="Add a comment..." 
                                                            className="min-h-[40px] h-[40px] py-2 resize-none text-sm bg-card border-border text-foreground"
                                                        />
                                                        <Button size="sm" onClick={() => handleAddComment(post.id)} className="h-[40px]">Post</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </StaggerContainer>
                    </div>
                </section>

                {/* Right Sidebar - Suggestions */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24">
                        <FadeInUp delay={0.2}>
                            <Card className="border-border shadow-sm bg-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="font-serif text-base text-card-foreground">People you may know</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {members
                                        // FIX: Filter only for users where status is 'none' (not connected AND not pending)
                                        .filter(m => getConnectionStatus(m.id).status === "none")
                                        .slice(0, 5)
                                        .map(m => (
                                            <div key={m.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <Avatar className="w-9 h-9 border border-border">
                                                        {/* FIX: Use getImageUrl for suggestions */}
                                                        <AvatarImage src={getImageUrl((m as any).profileImageUrl)} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-card-foreground truncate">{m.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{m.profession}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Connect Button (disappears immediately when clicked) */}
                                                <Button 
                                                    size="icon" 
                                                    variant="outline" 
                                                    className="h-8 w-8 rounded-full shrink-0 hover:border-primary hover:text-primary bg-transparent hover:bg-primary/5 border-border text-muted-foreground" 
                                                    onClick={() => handleSendRequest(m.id)}
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    <Button variant="link" className="w-full text-xs text-muted-foreground h-auto p-0 hover:text-primary">View all recommendations</Button>
                                </CardContent>
                            </Card>
                        </FadeInUp>
                    </div>
                </aside>
            </main>

            {/* --- DIALOGS --- */}

            {/* Create Post Dialog */}
            <Dialog open={isPostingDialogOpen} onOpenChange={(open) => {
                setIsPostingDialogOpen(open);
                if (!open) {
                    setPostContent("");
                    handleRemovePostImage();
                    setShowEmojiPicker(false);
                }
            }}>
                <DialogContent className="sm:max-w-[550px] p-0 gap-0 bg-card border-border overflow-visible">
                    <DialogHeader className="p-4 border-b border-border">
                        <DialogTitle className="text-lg font-semibold text-card-foreground">Create a post</DialogTitle>
                    </DialogHeader>
                    
                    <div className="p-4 space-y-4">
                        <div className="flex gap-3 mb-2">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={currentUser.avatar} />
                                <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-sm text-card-foreground">{profileData.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5 w-fit mt-0.5">
                                    <span>Anyone</span>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="What do you want to talk about?"
                            className="min-h-[150px] border-none focus-visible:ring-0 text-base resize-none p-0 placeholder:text-muted-foreground/50 bg-transparent text-foreground"
                        />

                        {/* Post Image Preview */}
                        {postImagePreview && (
                            <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                                <img src={postImagePreview} alt="Preview" className="w-full max-h-[300px] object-contain" />
                                <button 
                                    onClick={handleRemovePostImage}
                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-16 right-4 z-50 shadow-2xl rounded-xl border border-border bg-card">
                                <div className="flex justify-end p-2 border-b border-border">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowEmojiPicker(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <EmojiPicker 
                                    onEmojiClick={handleEmojiClick} 
                                    theme={Theme.AUTO}
                                    height={350}
                                    width={300}
                                    lazyLoadEmojis={true}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                                <ImageIcon className="w-5 h-5" />
                                <ImageUpload 
                                    onImageSelect={handleImageSelect} 
                                    onImageRemove={handleRemovePostImage}
                                    className="absolute inset-0 z-10 opacity-0 cursor-pointer w-full h-full" 
                                    disabled={isSubmittingPost}
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`rounded-full ${showEmojiPicker ? 'bg-muted text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsPostingDialogOpen(false)} className="text-muted-foreground">Cancel</Button>
                            <Button 
                                onClick={handleCreatePost} 
                                disabled={isSubmittingPost || (!postContent.trim() && !postImageFile)}
                                className="rounded-full px-6"
                            >
                                {isSubmittingPost ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Crop Dialog */}
            <Dialog open={isCroppingDialogOpen} onOpenChange={setIsCroppingDialogOpen}>
                <DialogContent className="sm:max-w-xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-card-foreground">Crop Image</DialogTitle>
                        <DialogDescription className="text-muted-foreground">Adjust the aspect ratio for your post.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg">
                        {tempImagePreview && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, p) => setCrop(p)}
                                onComplete={c => setCompletedCrop(c)}
                                aspect={16/9}
                                className="max-h-[60vh]"
                            >
                                <img ref={imgRef} src={tempImagePreview} alt="Crop" onLoad={e => {
                                    const { width, height } = e.currentTarget;
                                    const c = centerAspectCrop(width, height, 16/9);
                                    setCrop(c); setCompletedCrop(c);
                                }} />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsCroppingDialogOpen(false); setTempImageFile(null); }} className="text-foreground border-border">Cancel</Button>
                        <Button onClick={handleApplyCrop}>Apply Crop</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-card-foreground">Delete Post?</DialogTitle>
                        <DialogDescription className="text-muted-foreground">This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="text-foreground border-border">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeletePost}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}