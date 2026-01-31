// Storage Adapter Interface
// This abstraction allows swapping localStorage for Supabase/Firebase later

export interface StorageAdapter {
    get<T>(key: string): T | null;
    set<T>(key: string, value: T): void;
    remove(key: string): void;
    clear(): void;
}

class LocalStorageAdapter implements StorageAdapter {
    get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            console.error(`Error reading ${key} from localStorage`);
            return null;
        }
    }

    set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.error(`Error writing ${key} to localStorage`);
        }
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }
}

// Export singleton instance
export const storageAdapter: StorageAdapter = new LocalStorageAdapter();

// Storage keys - centralized for type safety
export const STORAGE_KEYS = {
    CURRENT_USER: 'mindbridge_current_user',
    USERS: 'mindbridge_users',
    MOOD_LOGS: 'mindbridge_mood_logs',
    JOURNALS: 'mindbridge_journals',
    CIRCLES: 'mindbridge_circles',
    MEMBERSHIPS: 'mindbridge_memberships',
    POSTS: 'mindbridge_posts',
    COMMENTS: 'mindbridge_comments',
} as const;

// Typed storage helpers
export const storage = {
    // User operations
    getCurrentUser: () => storageAdapter.get(STORAGE_KEYS.CURRENT_USER),
    setCurrentUser: <T>(user: T) => storageAdapter.set(STORAGE_KEYS.CURRENT_USER, user),
    clearCurrentUser: () => storageAdapter.remove(STORAGE_KEYS.CURRENT_USER),

    // Users database
    getUsers: () => storageAdapter.get(STORAGE_KEYS.USERS) || [],
    setUsers: <T>(users: T) => storageAdapter.set(STORAGE_KEYS.USERS, users),

    // Mood logs
    getMoodLogs: () => storageAdapter.get(STORAGE_KEYS.MOOD_LOGS) || [],
    setMoodLogs: <T>(logs: T) => storageAdapter.set(STORAGE_KEYS.MOOD_LOGS, logs),

    // Journals
    getJournals: () => storageAdapter.get(STORAGE_KEYS.JOURNALS) || [],
    setJournals: <T>(journals: T) => storageAdapter.set(STORAGE_KEYS.JOURNALS, journals),

    // Circles
    getCircles: () => storageAdapter.get(STORAGE_KEYS.CIRCLES),
    setCircles: <T>(circles: T) => storageAdapter.set(STORAGE_KEYS.CIRCLES, circles),

    // Memberships
    getMemberships: () => storageAdapter.get(STORAGE_KEYS.MEMBERSHIPS) || [],
    setMemberships: <T>(memberships: T) => storageAdapter.set(STORAGE_KEYS.MEMBERSHIPS, memberships),

    // Posts
    getPosts: () => storageAdapter.get(STORAGE_KEYS.POSTS) || [],
    setPosts: <T>(posts: T) => storageAdapter.set(STORAGE_KEYS.POSTS, posts),

    // Comments
    getComments: () => storageAdapter.get(STORAGE_KEYS.COMMENTS) || [],
    setComments: <T>(comments: T) => storageAdapter.set(STORAGE_KEYS.COMMENTS, comments),
};
