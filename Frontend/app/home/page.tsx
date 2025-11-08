"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { UserPlus, MapPin, Users, Edit3, Save, X, Image as ImageIcon, Heart, MessageSquare, Trash2 } from "lucide-react"
import {
    getUsersByProfession,
    LoginResponse,
    Connection,
    sendConnectionRequest,
    getSentPendingRequests,
    cancelConnectionRequest,
    getPendingRequests,
    getAcceptedConnections,
    PostResponse,
    createPost,
    getPostsByProfession,
    deletePost,
    toggleLike,
    addComment,
    CommentRequest
} from "@/lib/api"
import { motion } from "framer-motion"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations"
import toast from "react-hot-toast"

// Define the types for the data we'll get from the backend
interface UserProfile {
    id: number;
    name: string;
    profession: string;
    email: string;
}

// Define the types for the user data required by the Header component.
interface CurrentUser {
    name: string;
    avatar: string;
    community: string;
    pendingRequests?: number;
}

// Define types for the profile card
interface ProfileData {
    name: string;
    email: string;
    profession: string;
    location: string;
    connections: number;
    bio: string;
}

export default function HomePage() {
    const [members, setMembers] = useState<UserProfile[]>([])
    const [membersLoading, setMembersLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pendingRequests, setPendingRequests] = useState<Connection[]>([])
    const [sentPendingRequests, setSentPendingRequests] = useState<Connection[]>([])
    const [connections, setConnections] = useState<Connection[]>([])
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [authLoading, setAuthLoading] = useState(true);

    // Post-related states
    const [posts, setPosts] = useState<PostResponse[]>([])
    const [postsLoading, setPostsLoading] = useState(true)
    const [postContent, setPostContent] = useState("")
    const [isPostingDialogOpen, setIsPostingDialogOpen] = useState(false)
    const [isSubmittingPost, setIsSubmittingPost] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [postToDelete, setPostToDelete] = useState<number | null>(null)
    const [commentingOnPost, setCommentingOnPost] = useState<number | null>(null)
    const [commentText, setCommentText] = useState("")

    useEffect(() => {
        const userDataString = sessionStorage.getItem('user');

        if (!userDataString) {
            router.push('/login');
        } else {
            const user: LoginResponse = JSON.parse(userDataString);

            setCurrentUser({
                name: user.name,
                community: user.profession,
                avatar: "/placeholder.svg?height=40&width=40",
                pendingRequests: 0, // Will be updated after fetching
            });

            setProfileData({
                name: user.name,
                email: user.email,
                profession: user.profession,
                location: "New York, NY", // Mocked
                connections: 0, // Will be updated after fetching
                bio: "Passionate about my field and eager to connect with fellow professionals!",
            });

            fetchMembers(user.profession);
            fetchPendingRequests(user.id);
            fetchSentPendingRequests(user.id);
            fetchAcceptedConnections(user.id);
            fetchPosts(user.profession, user.id);
            setAuthLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const fetchMembers = async (profession: string) => {
        setMembersLoading(true)
        setError(null)
        try {
            const allMembers = await getUsersByProfession(profession);
            const userDataString = sessionStorage.getItem('user');
            if (userDataString) {
                const currentUser: LoginResponse = JSON.parse(userDataString);
                const otherMembers = allMembers.filter(member => member.id !== currentUser.id);
                setMembers(otherMembers);
            } else {
                setMembers(allMembers);
            }
        } catch (err: unknown) {
            console.error("[fetchMembers] Error:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to fetch members.");
            }
        } finally {
            setMembersLoading(false)
        }
    }

    const fetchPendingRequests = async (userId: number) => {
        try {
            const requests = await getPendingRequests(userId);
            setPendingRequests(requests);
            // Update the pending requests count in currentUser
            setCurrentUser((prev: CurrentUser | null) => prev ? { ...prev, pendingRequests: requests.length } : null);
        } catch (error) {
            console.error("Failed to fetch pending requests:", error);
        }
    };

    const fetchSentPendingRequests = async (userId: number) => {
        try {
            const requests = await getSentPendingRequests(userId);
            setSentPendingRequests(requests);
        } catch (error) {
            console.error("Failed to fetch sent pending requests:", error);
        }
    };

    const fetchAcceptedConnections = async (userId: number) => {
        try {
            const conns = await getAcceptedConnections(userId);
            setConnections(conns);
            // Update the connections count in profileData
            setProfileData((prev: ProfileData | null) => prev ? { ...prev, connections: conns.length } : null);
        } catch (error) {
            console.error("Failed to fetch accepted connections:", error);
        }
    };

    const fetchPosts = async (profession: string, userId: number) => {
        setPostsLoading(true);
        try {
            const fetchedPosts = await getPostsByProfession(profession, userId);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            toast.error("Failed to load posts");
        } finally {
            setPostsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) {
            toast.error("Post content cannot be empty");
            return;
        }

        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return;

        const user: LoginResponse = JSON.parse(userDataString);
        setIsSubmittingPost(true);

        try {
            const newPost = await createPost({ content: postContent, userId: user.id });
            setPostContent("");
            setIsPostingDialogOpen(false);
            toast.success("Post created successfully!");
            // Add the new post to the beginning of the posts array
            setPosts(prevPosts => [newPost, ...prevPosts]);
        } catch (error) {
            console.error("Failed to create post:", error);
            toast.error("Failed to create post");
        } finally {
            setIsSubmittingPost(false);
        }
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;

        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return;

        const user: LoginResponse = JSON.parse(userDataString);

        try {
            await deletePost(postToDelete, user.id);
            toast.success("Post deleted successfully!");
            setDeleteDialogOpen(false);
            setPostToDelete(null);
            // Refresh posts
            fetchPosts(user.profession, user.id);
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast.error("Failed to delete post");
        }
    };

    const handleToggleLike = async (postId: number) => {
        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return;

        const user: LoginResponse = JSON.parse(userDataString);

        try {
            const updatedPost = await toggleLike(postId, user.id);
            // Update the post in the list
            setPosts(prevPosts =>
                prevPosts.map(post => post.id === postId ? updatedPost : post)
            );
        } catch (error) {
            console.error("Failed to toggle like:", error);
            toast.error("Failed to update like");
        }
    };

    const handleAddComment = async (postId: number) => {
        if (!commentText.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return;

        const user: LoginResponse = JSON.parse(userDataString);

        try {
            const updatedPost = await addComment(postId, { content: commentText, userId: user.id });
            // Update the post in the list
            setPosts(prevPosts =>
                prevPosts.map(post => post.id === postId ? updatedPost : post)
            );
            setCommentText("");
            setCommentingOnPost(null);
            toast.success("Comment added!");
        } catch (error) {
            console.error("Failed to add comment:", error);
            toast.error("Failed to add comment");
        }
    };

    const openDeleteDialog = (postId: number) => {
        setPostToDelete(postId);
        setDeleteDialogOpen(true);
    };

    // Helper function to get connection status for a user
    const getConnectionStatus = (userId: number): { status: 'none' | 'pending' | 'connected', connectionId?: number } => {
        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return { status: 'none' };
        const currentUser: LoginResponse = JSON.parse(userDataString);

        // Check if I sent a pending request to this user
        const sentRequest = sentPendingRequests.find(
            req => req.requester.id === currentUser.id && req.receiver.id === userId
        );
        if (sentRequest) return { status: 'pending', connectionId: sentRequest.id };

        // Check if already connected
        const isConnected = connections.some(
            conn => (conn.requester.id === currentUser.id && conn.receiver.id === userId) ||
                (conn.receiver.id === currentUser.id && conn.requester.id === userId)
        );
        if (isConnected) return { status: 'connected' };

        return { status: 'none' };
    };

    const handleSendRequest = async (memberId: number) => {
        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return;

        const user: LoginResponse = JSON.parse(userDataString);
        try {
            await sendConnectionRequest(user.id, memberId);
            // Refetch sent pending requests to update the UI
            fetchSentPendingRequests(user.id);
            console.log("Connection request sent successfully");
        } catch (error) {
            console.error("Failed to send connection request:", error);
        }
    }

    const handleCancelRequest = async (connectionId: number) => {
        const userDataString = sessionStorage.getItem('user');
        if (!userDataString) return;

        const user: LoginResponse = JSON.parse(userDataString);
        try {
            await cancelConnectionRequest(connectionId);
            // Refetch sent pending requests to update the UI
            fetchSentPendingRequests(user.id);
            console.log("Connection request canceled successfully");
        } catch (error) {
            console.error("Failed to cancel connection request:", error);
        }
    }

    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioText, setBioText] = useState(profileData?.bio || "")
    const [tempBioText, setTempBioText] = useState(profileData?.bio || "")

    useEffect(() => {
        if (profileData) {
            setBioText(profileData.bio);
            setTempBioText(profileData.bio);
        }
    }, [profileData]);

    const handleSaveBio = () => {
        setBioText(tempBioText)
        setIsEditingBio(false)
    }

    const handleCancelBio = () => {
        setTempBioText(bioText)
        setIsEditingBio(false)
    }

    if (authLoading || !currentUser || !profileData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header user={currentUser} />

            <main className="container mx-auto grid lg:grid-cols-4 gap-8 py-8">

                {/* Left Sidebar (Sticky) */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        <FadeInUp>
                            <Card className="bg-card/50 rounded-2xl border">
                                <CardContent className="p-6">
                                    <div className="text-center pb-4">
                                        <Avatar className="w-24 h-24 mx-auto mb-4">
                                            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={profileData.name} />
                                            <AvatarFallback className="text-xl">
                                                {profileData.name.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h2 className="font-serif text-xl font-semibold">{profileData.name}</h2>
                                        <p className="text-muted-foreground text-sm space-y-1 mt-2">
                                            <span className="font-medium">{profileData.profession}</span>
                                            <span className="flex items-center justify-center space-x-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{profileData.location}</span>
                                            </span>
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="text-center">
                                                <div className="font-semibold text-lg">{profileData.connections}</div>
                                                <div className="text-xs text-muted-foreground">Connections</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold text-lg">{currentUser.pendingRequests}</div>
                                                <div className="text-xs text-muted-foreground">Requests</div>
                                            </div>
                                        </div>

                                        {/* Bio Section */}
                                        <div className="space-y-2 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-sm">About Me</h4>
                                                {!isEditingBio && (
                                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(true)} className="h-6 w-6 p-0">
                                                        <Edit3 className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                            {isEditingBio ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={tempBioText}
                                                        onChange={(e) => setTempBioText(e.target.value)}
                                                        placeholder="Write something about yourself..."
                                                        className="min-h-[80px] text-sm"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <Button size="sm" onClick={handleSaveBio} className="flex-1">
                                                            <Save className="w-3 h-3 mr-1" /> Save
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={handleCancelBio} className="flex-1 bg-transparent">
                                                            <X className="w-3 h-3 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground leading-relaxed">{bioText}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeInUp>
                    </div>
                </aside>

                {/* Middle Section (This is what scrolls) */}
                <section className="w-full lg:col-span-2 space-y-6">
                    {/* Create Post Card */}
                    <FadeInUp delay={0.1}>
                        <Card className="border">
                            <CardHeader className="flex-row items-center space-x-4 pb-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={profileData.name} />
                                    <AvatarFallback>{profileData.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div
                                    onClick={() => setIsPostingDialogOpen(true)}
                                    className="flex-1 bg-muted rounded-full py-3 px-4 text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                >
                                    What's on your mind, {profileData.name.split(" ")[0]}?
                                </div>
                            </CardHeader>
                            <CardContent className="flex justify-around pt-0">
                                <Button
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setIsPostingDialogOpen(true)}
                                >
                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-500" /> Create Post
                                </Button>
                            </CardContent>
                        </Card>
                    </FadeInUp>

                    <h3 className="font-serif text-xl font-semibold pt-4">Recent Activity</h3>

                    {/* Loading State */}
                    {postsLoading && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Loading posts...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!postsLoading && posts.length === 0 && (
                        <Card className="border">
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Posts Feed */}
                    <StaggerContainer stagger={0.1} className="space-y-6">
                        {!postsLoading && posts.map((post) => {
                            const userDataString = sessionStorage.getItem('user');
                            const currentUserId = userDataString ? JSON.parse(userDataString).id : null;
                            const isOwnPost = currentUserId === post.user.id;
                            const timeAgo = new Date(post.createdAt).toLocaleString();

                            return (
                                <div key={post.id}>
                                    <Card className="border">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={`/placeholder.svg?text=${post.user.name.split(" ").map(n => n[0]).join("")}`} alt={post.user.name} />
                                                        <AvatarFallback>{post.user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h4 className="font-semibold">{post.user.name}</h4>
                                                        <p className="text-xs text-muted-foreground">{post.user.profession} • {timeAgo}</p>
                                                    </div>
                                                </div>
                                                {isOwnPost && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(post.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-muted-foreground leading-relaxed">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center justify-between text-muted-foreground pt-4 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleLike(post.id)}
                                                    className={post.likedByCurrentUser ? "text-red-500" : ""}
                                                >
                                                    <Heart className={`w-4 h-4 mr-2 ${post.likedByCurrentUser ? "fill-current" : ""}`} />
                                                    {post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCommentingOnPost(commentingOnPost === post.id ? null : post.id)}
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
                                                </Button>
                                            </div>

                                            {/* Comments Section */}
                                            {post.comments.length > 0 && (
                                                <div className="space-y-3 pt-4 border-t">
                                                    {post.comments.map((comment) => (
                                                        <div key={comment.id} className="flex space-x-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarFallback className="text-xs">
                                                                    {comment.user.name.split(" ").map(n => n[0]).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 bg-muted rounded-lg p-3">
                                                                <p className="font-semibold text-sm">{comment.user.name}</p>
                                                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {new Date(comment.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add Comment Input */}
                                            {commentingOnPost === post.id && (
                                                <div className="flex space-x-2 pt-2">
                                                    <Textarea
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="min-h-[60px]"
                                                    />
                                                    <div className="flex flex-col space-y-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddComment(post.id)}
                                                        >
                                                            Post
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setCommentingOnPost(null);
                                                                setCommentText("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </StaggerContainer>
                </section>

                {/* Right Sidebar (Sticky) */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        <FadeInUp delay={0.2}>
                            <Card className="bg-card/50 rounded-2xl border">
                                <CardHeader>
                                    <CardTitle className="font-serif text-lg">Who to connect with</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                        {membersLoading && (
                                            <p className="text-sm text-muted-foreground">Loading...</p>
                                        )}

                                        {!membersLoading && error && (
                                            <p className="text-red-500 text-sm">Error loading members.</p>
                                        )}

                                        {!membersLoading && !error && members.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No new members in your community right now.
                                            </p>
                                        )}

                                        {!membersLoading && !error && members.length > 0 &&
                                            members
                                                .filter(member => {
                                                    // Filter out connected users
                                                    const { status } = getConnectionStatus(member.id);
                                                    return status !== 'connected';
                                                })
                                                .slice(0, 5)
                                                .map((member) => {
                                                    const connectionStatus = getConnectionStatus(member.id);
                                                    return (
                                                        <div key={member.id} className="flex items-center space-x-3">
                                                            <Avatar className="w-10 h-10">
                                                                <AvatarImage src={"/placeholder.svg"} alt={member.name} />
                                                                <AvatarFallback>
                                                                    {member.name.split(" ").map((n) => n[0]).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {member.profession}
                                                                </p>
                                                            </div>

                                                            {connectionStatus.status === 'none' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-transparent"
                                                                    onClick={() => handleSendRequest(member.id)}
                                                                >
                                                                    <UserPlus className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {connectionStatus.status === 'pending' && connectionStatus.connectionId && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-transparent"
                                                                    onClick={() => handleCancelRequest(connectionStatus.connectionId!)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                        }
                                    </div>


                                    <Button variant="link" size="sm" className="w-full mt-4">See all</Button>
                                </CardContent>
                            </Card>
                        </FadeInUp>
                    </div>
                </aside>
            </main>

            {/* Create Post Dialog */}
            <Dialog open={isPostingDialogOpen} onOpenChange={setIsPostingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a Post</DialogTitle>
                        <DialogDescription>
                            Share your thoughts with your professional community.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="min-h-[150px]"
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsPostingDialogOpen(false);
                                setPostContent("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePost}
                            disabled={isSubmittingPost || !postContent.trim()}
                        >
                            {isSubmittingPost ? "Posting..." : "Post"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setPostToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeletePost}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}