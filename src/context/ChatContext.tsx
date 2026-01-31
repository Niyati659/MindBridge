import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Message } from '../types';

interface ChatContextType {
    messages: Message[];
    isLoading: boolean;
    sendMessage: (receiverId: string, content: string) => Promise<boolean>;
    loadMessages: (friendId: string) => Promise<void>;
    markAsRead: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load messages for a specific friend
    const loadMessages = useCallback(async (friendId: string) => {
        if (!user) return;
        setIsLoading(true);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading messages:', error);
        } else {
            const mapped: Message[] = (data || []).map((m: any) => ({
                id: m.id,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                content: m.content,
                isRead: m.is_read,
                createdAt: m.created_at
            }));
            setMessages(mapped);
        }
        setIsLoading(false);
    }, [user]);

    // Send a message
    const sendMessage = async (receiverId: string, content: string): Promise<boolean> => {
        if (!user || !content.trim()) return false;

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                content: content.trim()
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return false;
        }

        const newMessage: Message = {
            id: data.id,
            senderId: data.sender_id,
            receiverId: data.receiver_id,
            content: data.content,
            isRead: data.is_read,
            createdAt: data.created_at
        };

        setMessages(prev => [...prev, newMessage]);
        return true;
    };

    // Mark message as read
    const markAsRead = async (messageId: string) => {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);

        if (!error) {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
        }
    };

    // Real-time subscription
    useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                const newMessage: Message = {
                    id: payload.new.id,
                    senderId: payload.new.sender_id,
                    receiverId: payload.new.receiver_id,
                    content: payload.new.content,
                    isRead: payload.new.is_read,
                    createdAt: payload.new.created_at
                };
                setMessages(prev => [...prev, newMessage]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    return (
        <ChatContext.Provider value={{
            messages,
            isLoading,
            sendMessage,
            loadMessages,
            markAsRead
        }}>
            {children}
        </ChatContext.Provider>
    );
};
