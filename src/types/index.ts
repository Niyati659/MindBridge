// Circle and related types
export interface Circle {
    id: string;
    name: string;
    description: string;
    tags: string[];
    coverImage?: string;
    visibility: 'public' | 'private';
    createdBy: string;
    createdAt: string;
    memberCount: number;
}

export interface CircleMembership {
    circleId: string;
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
    status: 'active' | 'pending';
}

export interface Post {
    id: string;
    circleId: string;
    authorId: string;
    authorName: string;
    title: string;
    body: string;
    createdAt: string;
    commentCount: number;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    body: string;
    createdAt: string;
}

// User type
export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    interests: string[];
    createdAt: string;
}

// Mood types
export interface MoodLog {
    id: string;
    userId: string;
    mood: 'good' | 'neutral' | 'bad';
    note?: string;
    visibility: 'private' | 'public';
    date: string;
    createdAt: string;
}

// Journal types
export interface JournalEntry {
    id: string;
    userId: string;
    title: string;
    body: string;
    visibility: 'private' | 'circle' | 'public';
    createdAt: string;
}

// Friendship types
export interface Friendship {
    id: string;
    requesterId: string;
    requesterName: string;
    addresseeId: string;
    addresseeName: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

// Message types
export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}
