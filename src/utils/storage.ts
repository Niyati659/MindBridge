// localStorage utility functions

const STORAGE_KEYS = {
    USER: 'mindbridge_user',
    USERS: 'mindbridge_users',
    MOOD_LOGS: 'mindbridge_mood_logs',
    CIRCLES: 'mindbridge_circles',
    POSTS: 'mindbridge_posts',
    COMMENTS: 'mindbridge_comments',
    JOURNALS: 'mindbridge_journals',
    NOTIFICATIONS: 'mindbridge_notifications',
};

export const storage = {
    // Generic get/set
    get: <T>(key: string): T | null => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },

    set: <T>(key: string, value: T): void => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    remove: (key: string): void => {
        localStorage.removeItem(key);
    },

    // Auth
    getCurrentUser: () => storage.get(STORAGE_KEYS.USER),
    setCurrentUser: (user: unknown) => storage.set(STORAGE_KEYS.USER, user),
    clearCurrentUser: () => storage.remove(STORAGE_KEYS.USER),

    // Users database
    getUsers: () => storage.get(STORAGE_KEYS.USERS) || [],
    setUsers: (users: unknown) => storage.set(STORAGE_KEYS.USERS, users),

    // Mood logs
    getMoodLogs: () => storage.get(STORAGE_KEYS.MOOD_LOGS) || [],
    setMoodLogs: (logs: unknown) => storage.set(STORAGE_KEYS.MOOD_LOGS, logs),

    // Circles
    getCircles: () => storage.get(STORAGE_KEYS.CIRCLES) || [],
    setCircles: (circles: unknown) => storage.set(STORAGE_KEYS.CIRCLES, circles),

    // Posts
    getPosts: () => storage.get(STORAGE_KEYS.POSTS) || [],
    setPosts: (posts: unknown) => storage.set(STORAGE_KEYS.POSTS, posts),

    // Comments
    getComments: () => storage.get(STORAGE_KEYS.COMMENTS) || [],
    setComments: (comments: unknown) => storage.set(STORAGE_KEYS.COMMENTS, comments),

    // Journals
    getJournals: () => storage.get(STORAGE_KEYS.JOURNALS) || [],
    setJournals: (journals: unknown) => storage.set(STORAGE_KEYS.JOURNALS, journals),

    // Notifications
    getNotifications: () => storage.get(STORAGE_KEYS.NOTIFICATIONS) || [],
    setNotifications: (notifs: unknown) => storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs),
};

export { STORAGE_KEYS };
