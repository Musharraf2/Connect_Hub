// src/lib/api.ts

// --- CONFIGURATION ---
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api";

// --- INTERFACES ---

export interface RegistrationRequestType {
    name: string;
    email: string;
    password: string;
    profession: string;
}

export interface LoginRequestType {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    name: string;
    email: string;
    profession: string;
}

// Profile Update Payload
export interface ProfileUpdatePayload {
    name?: string;
    location?: string;
    aboutMe?: string;
    phoneNumber?: string;
    university?: string;
    major?: string;
    year?: string;
    gpa?: string | number; // Allow string or number, backend handling dependent
    skills?: string[];
    interests?: string[];
    achievements?: string[];
    connectionsCount?: number;
    pendingRequestsCount?: number;
    profileImageUrl?: string;
    coverImageUrl?: string;
}

// Sub-types for User Detail
export interface AcademicInfo {
    id: number;
    userId: number;
    university: string;
    major: string;
    year: string;
    gpa: string;
}

export interface Skill {
    id: number;
    userId: number;
    skill: string;
}

export interface Interest {
    id: number;
    userId: number;
    interest: string;
}

// Full User Profile Response (DTO)
export interface UserProfileDetailResponse {
    id: number;
    name: string;
    email: string;
    profession: string;
    location: string | null;
    aboutMe: string | null;
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
    phoneNumber?: string | null;
    academicInfo: AcademicInfo | null;
    skills: Skill[];
    interests: Interest[];
    achievements?: string[];
    connectionsCount: number;
    pendingRequestsCount: number;
}

// Generic User Response (for Lists)
export interface UserProfileResponse {
    id: number;
    name: string;
    email: string;
    profession: string;
    aboutMe?: string | null;
    location?: string | null;
    profileImageUrl?: string | null;
}

export interface Connection {
    id: number;
    requester: UserProfileResponse;
    receiver: UserProfileResponse;
    status: string;
}

export interface PostRequest {
    content: string;
    userId: number;
}

export interface CommentRequest {
    content: string;
    userId: number;
}

export interface CommentResponse {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
        profileImageUrl?: string;
    };
    createdAt: string;
}

export interface CommentResponse {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
        profileImageUrl?: string;
    };
    createdAt: string;
}

// 🔵 AI note DTO (what backend sends)
export interface AiNoteDTO {
    noteText: string;
    category: string;
    autoDeleted: boolean;
    createdAt: string;
}

export interface PostResponse {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
        email: string;
        profession: string;
        profileImageUrl?: string;
    };
    profession: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
    comments: CommentResponse[];
    imageUrl?: string | null;

    // 🔥 NEW FIELDS for AI moderation / Grok notes
    deleted?: boolean;        // true when AI marked post as harmful
    aiNotes?: AiNoteDTO[];    // list of AI notes to show under the post
}


export interface NotificationDTO {
    id: number;
    type: "LIKE" | "COMMENT" | "CONNECTION_ACCEPTED" | "CONNECTION_REQUEST";
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedEntityId?: number;
    actor: {
        id: number;
        name: string;
        profileImageUrl?: string;
    };
}


// --- AUTHENTICATION ---

export const signupUser = async (userData: RegistrationRequestType) => {
    const response = await fetch(`${BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
    }
    return response.text();
};

export const loginUser = async (loginData: LoginRequestType): Promise<LoginResponse> => {
    const response = await fetch(`${BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Wrong credentials');
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
    }
    return await response.json();
};


// --- USER PROFILES ---

export async function getUserProfile(userId: number): Promise<UserProfileDetailResponse> {
    const res = await fetch(`${BASE}/users/${userId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
}

// *** FIXED UPDATE PROFILE FUNCTION ***
export async function updateProfile(
    userId: number,
    payload: ProfileUpdatePayload
): Promise<UserProfileDetailResponse> { // Changed return type to Detail to match backend usually
    const res = await fetch(`${BASE}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        // Capture the specific error message from the backend (e.g., "Bad Request")
        const errorText = await res.text();
        console.error("Backend Update Error:", errorText);
        throw new Error(errorText || "Failed to update profile");
    }
    return res.json();
}

export const getUsersByProfession = async (profession: string): Promise<UserProfileResponse[]> => {
    const response = await fetch(`${BASE}/users/by-profession?profession=${profession}`);
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Failed to fetch members');
    return await response.json();
};


// --- IMAGE UPLOAD ---

export const uploadProfileImage = async (userId: number, file: File): Promise<{ profileImageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE}/users/${userId}/profile-image`, {
        method: 'POST',
        body: formData, // Browser automatically sets Content-Type to multipart/form-data
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload profile image: ${errorText}`);
    }
    return await response.json();
};

export const uploadCoverImage = async (userId: number, file: File): Promise<{ coverImageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE}/users/${userId}/cover-image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload cover image: ${errorText}`);
    }
    return await response.json();
};

export const uploadPostImage = async (postId: number, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE}/posts/${postId}/image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload post image: ${errorText}`);
    }
    return await response.json();
};


// --- CONNECTIONS ---

export const sendConnectionRequest = async (requesterId: number, receiverId: number): Promise<string> => {
    const response = await fetch(`${BASE}/connections/send?requesterId=${requesterId}&receiverId=${receiverId}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to send request');
    return await response.text();
};

export const acceptConnectionRequest = async (connectionId: number): Promise<string> => {
    const response = await fetch(`${BASE}/connections/accept/${connectionId}`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to accept request');
    return await response.text();
};

export const declineConnectionRequest = async (connectionId: number): Promise<string> => {
    const response = await fetch(`${BASE}/connections/decline/${connectionId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to decline request');
    return await response.text();
};

export const cancelConnectionRequest = async (connectionId: number): Promise<string> => {
    const response = await fetch(`${BASE}/connections/decline/${connectionId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to cancel request');
    return await response.text();
};

export const getPendingRequests = async (receiverId: number): Promise<Connection[]> => {
    const response = await fetch(`${BASE}/connections/pending/${receiverId}`);
    if (!response.ok) throw new Error('Failed to fetch pending requests');
    return await response.json();
};

export const getSentPendingRequests = async (requesterId: number): Promise<Connection[]> => {
    const response = await fetch(`${BASE}/connections/sent-pending/${requesterId}`);
    if (!response.ok) throw new Error('Failed to fetch sent requests');
    return await response.json();
};

export const getAcceptedConnections = async (userId: number): Promise<Connection[]> => {
    const response = await fetch(`${BASE}/connections/accepted/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch connections');
    return await response.json();
};


// --- POSTS ---

export const createPost = async (postData: PostRequest): Promise<PostResponse> => {
    const response = await fetch(`${BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
};

export const getPostsByProfession = async (profession: string, userId: number): Promise<PostResponse[]> => {
    const response = await fetch(`${BASE}/posts/by-profession?profession=${encodeURIComponent(profession)}&userId=${userId}`);
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
};

export const deletePost = async (postId: number, userId: number): Promise<string> => {
    const response = await fetch(`${BASE}/posts/${postId}?userId=${userId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete post');
    return await response.text();
};

export const toggleLike = async (postId: number, userId: number): Promise<PostResponse> => {
    const response = await fetch(`${BASE}/posts/${postId}/like?userId=${userId}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to like post');
    return await response.json();
};

export const addComment = async (postId: number, commentData: CommentRequest): Promise<PostResponse> => {
    const response = await fetch(`${BASE}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to comment');
    return await response.json();
};

export const reportPost = async (postId: number, userId: number, reason: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE}/posts/${postId}/report?userId=${userId}&reason=${encodeURIComponent(reason)}`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to report post');
    return await response.json();
};


// --- NOTIFICATIONS ---

export const getNotifications = async (userId: number): Promise<NotificationDTO[]> => {
    const response = await fetch(`${BASE}/notifications/${userId}`);
    if (response.status === 204) return [];
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
};

export const getUnreadCount = async (userId: number): Promise<number> => {
    const response = await fetch(`${BASE}/notifications/${userId}/unread-count`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count;
};

export const markNotificationAsRead = async (notificationId: number): Promise<NotificationDTO> => {
    const response = await fetch(`${BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to mark read');
    return await response.json();
};

export const markAllNotificationsAsRead = async (userId: number): Promise<string> => {
    const response = await fetch(`${BASE}/notifications/${userId}/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to mark all read');
    const data = await response.json();
    return data.message;
};

export const deleteNotification = async (notificationId: number): Promise<string> => {
    const response = await fetch(`${BASE}/notifications/${notificationId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete notification');
    const data = await response.json();
    return data.message;
};


// --- MESSAGES ---

export interface MessageRequest {
    senderId: number;
    receiverId: number;
    content: string;
}

export interface MessageResponse {
    id: number;
    senderId: number;
    senderName: string;
    senderProfileImageUrl?: string;
    receiverId: number;
    receiverName: string;
    receiverProfileImageUrl?: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface ConversationResponse {
    userId: number;
    userName: string;
    userProfileImageUrl?: string;
    lastMessage: string;
    lastMessageTime: string | null;
    unreadCount: number;
    isOnline: boolean;
}

export const sendMessage = async (message: MessageRequest): Promise<MessageResponse> => {
    const response = await fetch(`${BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
};

export const getConversation = async (userId1: number, userId2: number): Promise<MessageResponse[]> => {
    const response = await fetch(`${BASE}/messages/conversation?userId1=${userId1}&userId2=${userId2}`);
    if (!response.ok) throw new Error('Failed to fetch conversation');
    return await response.json();
};

export const getConversations = async (userId: number): Promise<ConversationResponse[]> => {
    console.log(`[API] Fetching conversations for user ${userId} from ${BASE}/messages/conversations/${userId}`);
    const response = await fetch(`${BASE}/messages/conversations/${userId}`);
    console.log(`[API] Response status: ${response.status}`);
    
    if (response.status === 204) {
        console.log('[API] No content - returning empty array');
        return [];
    }
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response: ${errorText}`);
        throw new Error(errorText || 'Failed to fetch conversations');
    }
    
    const data = await response.json();
    console.log(`[API] Successfully fetched ${data.length} conversations`);
    return data;
};

export const markMessagesAsRead = async (receiverId: number, senderId: number): Promise<void> => {
    const response = await fetch(`${BASE}/messages/mark-read?receiverId=${receiverId}&senderId=${senderId}`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark messages as read');
};

export const getUnreadMessageCount = async (userId: number): Promise<number> => {
    const response = await fetch(`${BASE}/messages/unread-count/${userId}`);
    if (!response.ok) return 0;
    return await response.json();
};

export const deleteMessage = async (messageId: number, userId: number): Promise<void> => {
    const response = await fetch(`${BASE}/messages/${messageId}?userId=${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete message');
};