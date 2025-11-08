// src/lib/api.ts

// Define the type for the user registration data
export interface RegistrationRequestType {
    name: string;
    email: string;
    password: string;
    profession: string;
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
    profession: string;
    email: string;
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