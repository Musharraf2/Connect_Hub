// src/lib/api.ts

// Define the type for the user registration data
export interface RegistrationRequestType {
    name: string;
    email: string;
    password: string;
    profession: string;
}

// Define the request body type
export interface ProfileUpdatePayload {
    name?: string;
    location?: string;
    aboutMe?: string;
    university?: string;
    major?: string;
    year?: string;
    gpa?: string;
    skills?: string[];
    interests?: string[];
    connectionsCount?: number;
    pendingRequestsCount?: number;
    profileImageUrl?: string;
}

// Define the full UserProfile response type (must match backend User model)
export interface UserProfile {
    id: number;
    name: string;
    profession: string;
    email: string;
    location: string;
    aboutMe: string;
    profileImageUrl?: string | null;
    // ... other fields
}

// Define the type for the login request data
export interface LoginRequestType {
    email: string;
    password: string;
}

// Define the type for the login response data from the backend.
export interface LoginResponse {
    id: number;
    name: string;
    email: string;
    profession: string;
}

// Define the type for the user profile response from the backend.
export interface UserProfileResponse {
    id: number;
    name: string;
    email: string;
    profession: string;
    aboutMe?: string | null;
    location?: string | null;
}

// Define the type for Connection from backend
export interface Connection {
    id: number;
    requester: {
        id: number;
        name: string;
        email: string;
        profession: string;
    };
    receiver: {
        id: number;
        name: string;
        email: string;
        profession: string;
    };
    status: string;
}

// Define types for Posts
export interface PostRequest {
    content: string;
    userId: number;
}

export interface CommentRequest {
    content: string;
    userId: number;
}

export interface PostResponse {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
        email: string;
        profession: string;
    };
    profession: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
    comments: CommentResponse[];
    imageUrl?: string | null;
}

export interface CommentResponse {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
    };
    createdAt: string;
}

// Define the full User type structure (only showing relevant fields for profile)
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    profession: string;
    location: string;
    aboutMe: string; // Add this field
    // Add other fields you need
}

// Add these new types in lib/api.ts

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


// This matches your new backend DTO
// This matches your new backend DTO
export interface UserProfileDetailResponse {
  id: number;
  name: string;
  email: string;
  profession: string;
  location: string | null;
  aboutMe: string | null;
  profileImageUrl?: string | null;
  academicInfo: AcademicInfo | null;
  skills: Skill[];
  interests: Interest[];
  
  // --- ADD THESE TWO LINES ---
  connectionsCount: number;
  pendingRequestsCount: number;
}
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api";

export async function getUserProfile(userId: number): Promise<UserProfileDetailResponse> { // <-- 1. Change return type
    const res = await fetch(`${BASE}/users/${userId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json(); // <-- 2. This now returns the new DTO
}

export async function updateProfile(
    userId: number,
    payload: ProfileUpdatePayload
): Promise<UserProfileResponse> {
    const res = await fetch(`${BASE}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
}





// This function sends the registration data to your Spring backend.
export const signupUser = async (userData: RegistrationRequestType) => {
    const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Network response was not ok');
    }

    return response.text();
};

// This function handles the API call for user login
export const loginUser = async (loginData: LoginRequestType): Promise<LoginResponse> => {
    try {
        const response = await fetch('http://localhost:8080/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        return await response.json();
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};

// This function handles the API call to get users by profession
export const getUsersByProfession = async (profession: string): Promise<UserProfileResponse[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/users/by-profession?profession=${profession}`);

        // --- THIS IS THE FIX ---
        // If status is 204 (No Content), it means the list is empty.
        // Return an empty array instead of trying to parse JSON.
        if (response.status === 204) {
            return []; 
        }
        // --- END OF FIX ---

        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        
        return await response.json(); // Now this will only run if there is content
    } catch (error) {
        console.error("Failed to fetch members:", error);
        throw error;
    }
};

// Connection API functions

export const sendConnectionRequest = async (requesterId: number, receiverId: number): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/send?requesterId=${requesterId}&receiverId=${receiverId}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to send connection request: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Failed to send connection request:", error);
        throw error;
    }
};

export const acceptConnectionRequest = async (connectionId: number): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/accept/${connectionId}`, {
            method: 'PUT',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to accept connection request: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Failed to accept connection request:", error);
        throw error;
    }
};

export const declineConnectionRequest = async (connectionId: number): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/decline/${connectionId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to decline connection request: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Failed to decline connection request:", error);
        throw error;
    }
};

export const getPendingRequests = async (receiverId: number): Promise<Connection[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/pending/${receiverId}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to fetch pending requests: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch pending requests:", error);
        throw error;
    }
};

export const getSentPendingRequests = async (requesterId: number): Promise<Connection[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/sent-pending/${requesterId}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to fetch sent pending requests: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch sent pending requests:", error);
        throw error;
    }
};

export const cancelConnectionRequest = async (connectionId: number): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/decline/${connectionId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to cancel connection request: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Failed to cancel connection request:", error);
        throw error;
    }
};

export const getAcceptedConnections = async (userId: number): Promise<Connection[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/connections/accepted/${userId}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to fetch accepted connections: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch accepted connections:", error);
        throw error;
    }
};

// Post API functions

export const createPost = async (postData: PostRequest): Promise<PostResponse> => {
    try {
        const response = await fetch('http://localhost:8080/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
};

export const getPostsByProfession = async (profession: string, userId: number): Promise<PostResponse[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/posts/by-profession?profession=${encodeURIComponent(profession)}&userId=${userId}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to fetch posts: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        throw error;
    }
};

export const deletePost = async (postId: number, userId: number): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}?userId=${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to delete post: ${response.status} - ${errorText}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Failed to delete post:", error);
        throw error;
    }
};

export const toggleLike = async (postId: number, userId: number): Promise<PostResponse> => {
    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}/like?userId=${userId}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to toggle like: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to toggle like:", error);
        throw error;
    }
};

export const addComment = async (postId: number, commentData: CommentRequest): Promise<PostResponse> => {
    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to add comment: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to add comment:", error);
        throw error;
    }
};

// Image upload functions

export const uploadProfileImage = async (userId: number, file: File): Promise<{ profileImageUrl: string }> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE}/users/${userId}/profile-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to upload profile image: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to upload profile image:", error);
        throw error;
    }
};

export const uploadPostImage = async (postId: number, file: File): Promise<{ imageUrl: string }> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE}/posts/${postId}/image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to upload post image: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to upload post image:", error);
        throw error;
    }
};
