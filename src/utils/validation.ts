import { z } from 'zod';

// User validation schema
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
    displayName: z.string().min(1, 'Display name required'),
    bio: z.string().max(500, 'Bio too long').optional().default(''),
    avatar: z.string().optional().default(''),
    interests: z.array(z.string()).optional().default([]),
    createdAt: z.string().datetime(),
});

// Login validation
export const loginSchema = z.object({
    email: z.string().min(1, 'Email or username required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Signup validation
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Mood log validation
export const moodLogSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    mood: z.enum(['good', 'neutral', 'bad']),
    note: z.string().max(500).optional(),
    visibility: z.enum(['private', 'public']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    createdAt: z.string().datetime(),
});

// Journal entry validation
export const journalSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    title: z.string().min(1, 'Title required').max(100, 'Title too long'),
    body: z.string().min(1, 'Body required').max(10000, 'Content too long'),
    visibility: z.enum(['private', 'circle', 'public']),
    createdAt: z.string().datetime(),
});

// Circle validation
export const circleSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, 'Circle name must be at least 3 characters').max(50, 'Name too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
    tags: z.array(z.string()).max(10, 'Too many tags'),
    visibility: z.enum(['public', 'private']),
    createdBy: z.string(),
    createdAt: z.string().datetime(),
    memberCount: z.number().int().min(0),
});

// Post validation
export const postSchema = z.object({
    id: z.string().uuid(),
    circleId: z.string().uuid(),
    authorId: z.string().uuid(),
    authorName: z.string(),
    title: z.string().min(1, 'Title required').max(200, 'Title too long'),
    body: z.string().min(1, 'Content required').max(5000, 'Content too long'),
    createdAt: z.string().datetime(),
    commentCount: z.number().int().min(0),
});

// Comment validation
export const commentSchema = z.object({
    id: z.string().uuid(),
    postId: z.string().uuid(),
    authorId: z.string().uuid(),
    authorName: z.string(),
    body: z.string().min(1, 'Comment required').max(1000, 'Comment too long'),
    createdAt: z.string().datetime(),
});

// Helper function to validate with nice errors
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.errors.map(e => e.message),
    };
}

// Type exports
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type MoodLogInput = z.infer<typeof moodLogSchema>;
export type JournalInput = z.infer<typeof journalSchema>;
export type CircleInput = z.infer<typeof circleSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
