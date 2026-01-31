import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'mindbridge-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Type definitions for database tables
export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    bio: string;
    avatar_url: string;
    interests: string[];
    created_at: string;
}

export interface MoodLogRow {
    id: string;
    user_id: string;
    mood: 'good' | 'neutral' | 'bad';
    note: string | null;
    visibility: 'private' | 'public';
    date: string;
    created_at: string;
}

export interface JournalRow {
    id: string;
    user_id: string;
    title: string;
    body: string;
    visibility: 'private' | 'circle' | 'public';
    created_at: string;
}

export interface CircleRow {
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    visibility: 'public' | 'private';
    created_by: string | null;
    member_count: number;
    created_at: string;
}

export interface MembershipRow {
    circle_id: string;
    user_id: string;
    role: 'admin' | 'member';
    status: 'active' | 'pending';
    joined_at: string;
}

export interface PostRow {
    id: string;
    circle_id: string;
    author_id: string;
    title: string;
    body: string;
    comment_count: number;
    created_at: string;
}

export interface CommentRow {
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    created_at: string;
}
