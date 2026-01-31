import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    interests: string[];
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Convert Supabase profile to our User type
const profileToUser = (profile: Profile, email: string): User => ({
    id: profile.id,
    email,
    username: profile.username,
    displayName: profile.display_name || profile.username,
    bio: profile.bio || '',
    avatar: profile.avatar_url || '',
    interests: profile.interests || [],
    createdAt: profile.created_at,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await loadUserProfile(session.user);
            }
            setIsLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.id);
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
                await loadUserProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (authUser: SupabaseUser) => {
        console.log('loadUserProfile: Starting for user:', authUser.id);

        try {
            console.log('loadUserProfile: Making Supabase request...');

            // Race between the query and a timeout
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Query timeout after 10s')), 10000);
            });

            const queryPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

            console.log('loadUserProfile: Query completed', { profile, error });

            if (error) {
                console.error('loadUserProfile: Failed to load profile:', error);
                return;
            }

            if (profile) {
                console.log('loadUserProfile: Setting user state with profile:', profile.username);
                setUser(profileToUser(profile, authUser.email || ''));
                console.log('loadUserProfile: User state updated');
            } else {
                console.warn('loadUserProfile: No profile found for user');
            }
        } catch (err) {
            console.error('loadUserProfile: Caught error:', err);
        }
        console.log('loadUserProfile: Done');
    };

    const login = async (email: string, password: string) => {
        const startTime = Date.now();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        console.log(`login: ${Date.now() - startTime} ms`);

        if (error) {
            console.error('Login error:', error);
            if (error.message.includes('rate') || error.status === 429) {
                return { success: false, error: 'Too many attempts. Please wait a few minutes.' };
            }
            return { success: false, error: error.message };
        }

        // Load profile directly and wait for it (with timeout)
        if (data.user) {
            await loadUserProfile(data.user);
        }

        return { success: true };
    };

    const signup = async (email: string, username: string, password: string) => {
        // Username uniqueness is enforced by database constraint
        // Profile is created via trigger with username from metadata
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    display_name: username,
                },
            },
        });

        if (error) {
            // Handle rate limiting
            if (error.message.includes('rate') || error.status === 429) {
                return { success: false, error: 'Too many attempts. Please wait a few minutes and try again.' };
            }
            // Handle duplicate email
            if (error.message.includes('already registered')) {
                return { success: false, error: 'This email is already registered. Try logging in instead.' };
            }
            return { success: false, error: error.message };
        }
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: updates.displayName,
                bio: updates.bio,
                avatar_url: updates.avatar,
                interests: updates.interests,
            })
            .eq('id', user.id);

        if (!error) {
            setUser({ ...user, ...updates });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};