import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase, type CircleRow, type MembershipRow, type PostRow, type CommentRow, type Profile } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Circle, CircleMembership, Post, Comment } from '../types';

interface CircleContextType {
    circles: Circle[];
    myCircles: Circle[];
    joinedCircles: Circle[];
    posts: Post[];
    isLoading: boolean;
    createCircle: (circle: Omit<Circle, 'id' | 'createdAt' | 'memberCount' | 'createdBy'>) => Promise<Circle | null>;
    joinCircle: (circleId: string) => Promise<void>;
    leaveCircle: (circleId: string) => Promise<void>;
    isJoined: (circleId: string) => boolean;
    getCirclePosts: (circleId: string) => Post[];
    createPost: (circleId: string, title: string, body: string) => Promise<Post | null>;
    addComment: (postId: string, body: string) => Promise<Comment | null>;
    getComments: (postId: string) => Promise<Comment[]>;
    refreshCircles: () => Promise<void>;
}

const CircleContext = createContext<CircleContextType | null>(null);

export const useCircles = () => {
    const context = useContext(CircleContext);
    if (!context) throw new Error('useCircles must be used within CircleProvider');
    return context;
};

// Convert database row to app type
const rowToCircle = (row: CircleRow): Circle => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    tags: row.tags || [],
    visibility: row.visibility as 'public' | 'private',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    memberCount: row.member_count,
});

const rowToPost = (row: PostRow & { profiles?: Profile }): Post => ({
    id: row.id,
    circleId: row.circle_id,
    authorId: row.author_id,
    authorName: row.profiles?.display_name || row.profiles?.username || 'Anonymous',
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    commentCount: row.comment_count,
});

const rowToComment = (row: CommentRow & { profiles?: Profile }): Comment => ({
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.profiles?.display_name || row.profiles?.username || 'Anonymous',
    body: row.body,
    createdAt: row.created_at,
});

export const CircleProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [circles, setCircles] = useState<Circle[]>([]);
    const [memberships, setMemberships] = useState<CircleMembership[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshCircles = useCallback(async () => {
        setIsLoading(true);

        // Fetch circles
        const { data: circleData } = await supabase
            .from('circles')
            .select('*')
            .order('created_at', { ascending: false });

        if (circleData) {
            setCircles(circleData.map(rowToCircle));
        }

        // Fetch user's memberships
        if (user) {
            const { data: membershipData } = await supabase
                .from('circle_memberships')
                .select('*')
                .eq('user_id', user.id);

            if (membershipData) {
                setMemberships(membershipData.map(m => ({
                    circleId: m.circle_id,
                    userId: m.user_id,
                    role: m.role as 'admin' | 'member',
                    status: m.status as 'active' | 'pending',
                    joinedAt: m.joined_at,
                })));
            }
        }

        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        refreshCircles();
    }, [refreshCircles]);

    const myCircles = circles.filter(c => c.createdBy === user?.id);
    const joinedCircles = circles.filter(c =>
        memberships.some(m => m.circleId === c.id && m.status === 'active')
    );

    const createCircle = async (data: Omit<Circle, 'id' | 'createdAt' | 'memberCount' | 'createdBy'>) => {
        if (!user) {
            console.error('createCircle: No user logged in');
            return null;
        }

        console.log('Creating circle with user:', user.id);
        console.log('Circle data:', data);

        try {
            console.log('Starting Supabase insert...');
            const insertData = {
                name: data.name,
                description: data.description,
                tags: data.tags,
                visibility: data.visibility,
                created_by: user.id,
            };
            console.log('Insert payload:', insertData);

            const { data: newCircle, error } = await supabase
                .from('circles')
                .insert(insertData)
                .select()
                .single();

            console.log('Insert completed. Result:', { newCircle, error });

            if (error) {
                console.error('createCircle error:', error);
                return null;
            }

            if (!newCircle) {
                console.error('createCircle: No data returned');
                return null;
            }

            console.log('Circle created:', newCircle.id);

            // Auto-join as admin
            console.log('Adding membership...');
            const { error: membershipError } = await supabase.from('circle_memberships').insert({
                circle_id: newCircle.id,
                user_id: user.id,
                role: 'admin',
                status: 'active',
            });

            if (membershipError) {
                console.error('Membership creation error:', membershipError);
            } else {
                console.log('Membership created successfully');
            }

            console.log('Refreshing circles...');
            await refreshCircles();
            console.log('Done!');
            return rowToCircle(newCircle);
        } catch (err) {
            console.error('Unexpected error in createCircle:', err);
            return null;
        }
    };

    const joinCircle = async (circleId: string) => {
        if (!user) return;

        const circle = circles.find(c => c.id === circleId);
        if (!circle) return;

        await supabase.from('circle_memberships').insert({
            circle_id: circleId,
            user_id: user.id,
            role: 'member',
            status: circle.visibility === 'public' ? 'active' : 'pending',
        });

        // Update member count
        if (circle.visibility === 'public') {
            await supabase
                .from('circles')
                .update({ member_count: circle.memberCount + 1 })
                .eq('id', circleId);
        }

        await refreshCircles();
    };

    const leaveCircle = async (circleId: string) => {
        if (!user) return;

        await supabase
            .from('circle_memberships')
            .delete()
            .eq('circle_id', circleId)
            .eq('user_id', user.id);

        const circle = circles.find(c => c.id === circleId);
        if (circle) {
            await supabase
                .from('circles')
                .update({ member_count: Math.max(0, circle.memberCount - 1) })
                .eq('id', circleId);
        }

        await refreshCircles();
    };

    const isJoined = (circleId: string) => {
        return memberships.some(m => m.circleId === circleId && m.status === 'active');
    };

    const getCirclePosts = (circleId: string) => {
        return posts.filter(p => p.circleId === circleId);
    };

    const createPost = async (circleId: string, title: string, body: string) => {
        if (!user) return null;

        const { data: newPost, error } = await supabase
            .from('posts')
            .insert({
                circle_id: circleId,
                author_id: user.id,
                title,
                body,
            })
            .select('*, profiles(*)')
            .single();

        if (error || !newPost) return null;

        const post = rowToPost(newPost);
        setPosts(prev => [post, ...prev]);
        return post;
    };

    const addComment = async (postId: string, body: string) => {
        if (!user) return null;

        const { data: newComment, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                author_id: user.id,
                body,
            })
            .select('*, profiles(*)')
            .single();

        if (error || !newComment) return null;
        return rowToComment(newComment);
    };

    const getComments = async (postId: string): Promise<Comment[]> => {
        const { data } = await supabase
            .from('comments')
            .select('*, profiles(*)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        return data ? data.map(rowToComment) : [];
    };

    return (
        <CircleContext.Provider value={{
            circles,
            myCircles,
            joinedCircles,
            posts,
            isLoading,
            createCircle,
            joinCircle,
            leaveCircle,
            isJoined,
            getCirclePosts,
            createPost,
            addComment,
            getComments,
            refreshCircles,
        }}>
            {children}
        </CircleContext.Provider>
    );
};
