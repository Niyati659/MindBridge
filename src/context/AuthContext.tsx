import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => { success: boolean; error?: string };
    signup: (email: string, username: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
    updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for existing session
        const savedUser = storage.getCurrentUser() as User | null;
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    const login = (email: string, password: string) => {
        const users = storage.getUsers() as Array<User & { password: string }>;
        const foundUser = users.find(
            (u) => (u.email === email || u.username === email) && u.password === password
        );

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            storage.setCurrentUser(userWithoutPassword);
            return { success: true };
        }
        return { success: false, error: 'Invalid email/username or password' };
    };

    const signup = (email: string, username: string, password: string) => {
        const users = storage.getUsers() as Array<User & { password: string }>;

        // Check if email or username exists
        if (users.some((u) => u.email === email)) {
            return { success: false, error: 'Email already exists' };
        }
        if (users.some((u) => u.username === username)) {
            return { success: false, error: 'Username already taken' };
        }

        const newUser: User & { password: string } = {
            id: crypto.randomUUID(),
            email,
            username,
            password,
            displayName: username,
            bio: '',
            avatar: '',
            interests: [],
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        storage.setUsers(users);

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        storage.setCurrentUser(userWithoutPassword);

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        storage.clearCurrentUser();
    };

    const updateProfile = (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        storage.setCurrentUser(updatedUser);

        // Also update in users database
        const users = storage.getUsers() as Array<User & { password: string }>;
        const index = users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            storage.setUsers(users);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
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
