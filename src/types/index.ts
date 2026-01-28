// User and Auth types for MindBridge

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

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export interface MoodEntry {
    id: string;
    userId: string;
    value: 'good' | 'neutral' | 'bad';
    note: string;
    date: string; // YYYY-MM-DD
    visibility: 'private' | 'circle' | 'public';
    circleIds?: string[];
    createdAt: string;
}

export interface Circle {
    id: string;
    title: string;
    description: string;
    tags: string[];
    visibility: 'public' | 'private';
    coverImage?: string;
    creatorId: string;
    adminIds: string[];
    memberIds: string[];
    pendingIds: string[]; // for private circles
    createdAt: string;
}

export interface Post {
    id: string;
    circleId: string;
    authorId: string;
    title: string;
    body: string;
    attachment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    body: string;
    createdAt: string;
}

export interface JournalEntry {
    id: string;
    userId: string;
    title: string;
    body: string;
    visibility: 'private' | 'circle' | 'public';
    circleIds?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'comment' | 'join_request' | 'circle_update';
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}
