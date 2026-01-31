import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Friendship } from '../types';

interface FriendsContextType {
    friends: Friendship[];
    pendingRequests: Friendship[];
    sentRequests: Friendship[];
    isLoading: boolean;
    sendFriendRequest: (userId: string) => Promise<boolean>;
    acceptRequest: (friendshipId: string) => Promise<boolean>;
    rejectRequest: (friendshipId: string) => Promise<boolean>;
    cancelRequest: (friendshipId: string) => Promise<boolean>;
    removeFriend: (friendshipId: string) => Promise<boolean>;
    getFriendshipStatus: (userId: string) => 'none' | 'pending_sent' | 'pending_received' | 'friends';
    refreshFriends: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
    const context = useContext(FriendsContext);
    if (!context) {
        throw new Error('useFriends must be used within a FriendsProvider');
    }
    return context;
};

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [friendships, setFriendships] = useState<Friendship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load all friendships for current user
    const loadFriendships = useCallback(async () => {
        if (!user) {
            setFriendships([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const { data, error } = await supabase
            .from('friendships')
            .select(`
                id,
                requester_id,
                addressee_id,
                status,
                created_at,
                requester:profiles!friendships_requester_id_fkey(display_name),
                addressee:profiles!friendships_addressee_id_fkey(display_name)
            `)
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .neq('status', 'rejected');

        if (error) {
            console.error('Error loading friendships:', error);
            setIsLoading(false);
            return;
        }

        const mapped: Friendship[] = (data || []).map((f: any) => ({
            id: f.id,
            requesterId: f.requester_id,
            requesterName: f.requester?.display_name || 'Unknown',
            addresseeId: f.addressee_id,
            addresseeName: f.addressee?.display_name || 'Unknown',
            status: f.status,
            createdAt: f.created_at
        }));

        setFriendships(mapped);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        loadFriendships();
    }, [loadFriendships]);

    // Computed lists
    const friends = friendships.filter(f => f.status === 'accepted');

    const pendingRequests = friendships.filter(
        f => f.status === 'pending' && f.addresseeId === user?.id
    );

    const sentRequests = friendships.filter(
        f => f.status === 'pending' && f.requesterId === user?.id
    );

    // Send friend request
    const sendFriendRequest = async (userId: string): Promise<boolean> => {
        if (!user || userId === user.id) return false;

        // Check if friendship already exists
        const existing = friendships.find(
            f => (f.requesterId === userId || f.addresseeId === userId)
        );
        if (existing) return false;

        const { data, error } = await supabase
            .from('friendships')
            .insert({
                requester_id: user.id,
                addressee_id: userId,
                status: 'pending'
            })
            .select(`
                id,
                requester_id,
                addressee_id,
                status,
                created_at
            `)
            .single();

        if (error) {
            console.error('Error sending friend request:', error);
            return false;
        }

        // Get the addressee's name
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', userId)
            .single();

        const newFriendship: Friendship = {
            id: data.id,
            requesterId: data.requester_id,
            requesterName: user.displayName,
            addresseeId: data.addressee_id,
            addresseeName: profile?.display_name || 'Unknown',
            status: 'pending',
            createdAt: data.created_at
        };

        setFriendships(prev => [...prev, newFriendship]);
        return true;
    };

    // Accept friend request
    const acceptRequest = async (friendshipId: string): Promise<boolean> => {
        if (!user) return false;

        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', friendshipId)
            .eq('addressee_id', user.id);

        if (error) {
            console.error('Error accepting request:', error);
            return false;
        }

        setFriendships(prev => prev.map(f =>
            f.id === friendshipId ? { ...f, status: 'accepted' } : f
        ));
        return true;
    };

    // Reject friend request
    const rejectRequest = async (friendshipId: string): Promise<boolean> => {
        if (!user) return false;

        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId)
            .eq('addressee_id', user.id);

        if (error) {
            console.error('Error rejecting request:', error);
            return false;
        }

        setFriendships(prev => prev.filter(f => f.id !== friendshipId));
        return true;
    };

    // Cancel sent request
    const cancelRequest = async (friendshipId: string): Promise<boolean> => {
        if (!user) return false;

        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId)
            .eq('requester_id', user.id);

        if (error) {
            console.error('Error canceling request:', error);
            return false;
        }

        setFriendships(prev => prev.filter(f => f.id !== friendshipId));
        return true;
    };

    // Remove friend
    const removeFriend = async (friendshipId: string): Promise<boolean> => {
        if (!user) return false;

        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId);

        if (error) {
            console.error('Error removing friend:', error);
            return false;
        }

        setFriendships(prev => prev.filter(f => f.id !== friendshipId));
        return true;
    };

    // Get friendship status with a user
    const getFriendshipStatus = (userId: string): 'none' | 'pending_sent' | 'pending_received' | 'friends' => {
        if (!user) return 'none';

        const friendship = friendships.find(
            f => f.requesterId === userId || f.addresseeId === userId
        );

        if (!friendship) return 'none';
        if (friendship.status === 'accepted') return 'friends';
        if (friendship.requesterId === user.id) return 'pending_sent';
        return 'pending_received';
    };

    const refreshFriends = async () => {
        await loadFriendships();
    };

    return (
        <FriendsContext.Provider value={{
            friends,
            pendingRequests,
            sentRequests,
            isLoading,
            sendFriendRequest,
            acceptRequest,
            rejectRequest,
            cancelRequest,
            removeFriend,
            getFriendshipStatus,
            refreshFriends
        }}>
            {children}
        </FriendsContext.Provider>
    );
};
