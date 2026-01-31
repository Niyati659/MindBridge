import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCircles } from '../context/CircleContext';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../context/FriendsContext';
import { EmptyState } from '../components/common/EmptyState';
import {
    Users, MessageCircle, Send, ArrowLeft, Plus,
    Edit2, Trash2, UserPlus
} from 'lucide-react';
import type { Circle, Post, Comment } from '../types';

// Component to handle async loading of comments
const CommentsSection = ({
    postId,
    joined,
    isCircleAdmin,
    currentUserId,
    getComments,
    addComment,
    editComment,
    deleteComment
}: {
    postId: string;
    joined: boolean;
    isCircleAdmin: boolean;
    currentUserId: string | undefined;
    getComments: (postId: string) => Promise<Comment[]>;
    addComment: (postId: string, body: string) => Promise<Comment | null>;
    editComment: (commentId: string, body: string) => Promise<boolean>;
    deleteComment: (commentId: string, postId: string) => Promise<boolean>;
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true);
            const loaded = await getComments(postId);
            setComments(loaded);
            setIsLoading(false);
        };
        loadComments();
    }, [postId, getComments]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        const newComment = await addComment(postId, commentText.trim());
        if (newComment) {
            setComments(prev => [...prev, newComment]);
        }
        setCommentText('');
    };

    const handleEditComment = async (commentId: string) => {
        if (!editText.trim()) return;
        const success = await editComment(commentId, editText.trim());
        if (success) {
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, body: editText.trim() } : c
            ));
        }
        setEditingComment(null);
        setEditText('');
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        const success = await deleteComment(commentId, postId);
        if (success) {
            setComments(prev => prev.filter(c => c.id !== commentId));
        }
    };

    const canModify = (authorId: string) => {
        return currentUserId === authorId || isCircleAdmin;
    };

    if (isLoading) {
        return <div style={{ color: '#666', fontSize: 13 }}>Loading comments...</div>;
    }

    return (
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
            {comments.map(comment => (
                <div key={comment.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: '#a78bfa', fontWeight: 500 }}>{comment.authorName}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#555' }}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {canModify(comment.authorId) && (
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                        onClick={() => {
                                            setEditingComment(comment.id);
                                            setEditText(comment.body);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#666',
                                            cursor: 'pointer',
                                            padding: 2
                                        }}
                                        title="Edit comment"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: 2
                                        }}
                                        title="Delete comment"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {editingComment === comment.id ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="text-input"
                                style={{ marginBottom: 0, flex: 1 }}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditComment(comment.id)}
                                autoFocus
                            />
                            <button
                                onClick={() => handleEditComment(comment.id)}
                                className="btn-primary"
                                style={{ padding: '8px 12px', fontSize: 12 }}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingComment(null)}
                                style={{
                                    padding: '8px 12px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6,
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: 12
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: '#ccc', fontSize: 13 }}>{comment.body}</p>
                    )}
                </div>
            ))}

            {joined && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="text-input"
                        style={{ marginBottom: 0, flex: 1 }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                        onClick={handleAddComment}
                        className="btn-primary"
                        style={{ padding: '10px 14px' }}
                    >
                        <Send size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export const CircleDetailPage = () => {
    const { circleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        circles, isJoined, isAdmin, joinCircle, leaveCircle,
        getCirclePosts, loadCirclePosts, createPost,
        addComment, getComments, editComment, deleteComment,
        editPost, deletePost
    } = useCircles();
    const { sendFriendRequest, getFriendshipStatus } = useFriends();

    const [circle, setCircle] = useState<Circle | null>(null);
    const [showPostEditor, setShowPostEditor] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editPostTitle, setEditPostTitle] = useState('');
    const [editPostBody, setEditPostBody] = useState('');

    useEffect(() => {
        const found = circles.find(c => c.id === circleId);
        setCircle(found || null);

        // Load posts from database when viewing a circle
        if (circleId) {
            loadCirclePosts(circleId);
        }
    }, [circles, circleId, loadCirclePosts]);

    if (!circle) {
        return (
            <div className="page-container">
                <EmptyState
                    title="Circle not found"
                    description="This circle may have been deleted or doesn't exist."
                    action={
                        <button className="btn-primary" onClick={() => navigate('/circles')}>
                            Back to Circles
                        </button>
                    }
                />
            </div>
        );
    }

    const posts = getCirclePosts(circle.id);
    const joined = isJoined(circle.id);
    const circleAdmin = isAdmin(circle.id);

    const handleCreatePost = () => {
        if (!postTitle.trim() || !postBody.trim()) return;
        createPost(circle.id, postTitle.trim(), postBody.trim());
        setPostTitle('');
        setPostBody('');
        setShowPostEditor(false);
    };

    const handleEditPost = async (postId: string) => {
        if (!editPostTitle.trim() || !editPostBody.trim()) return;
        const success = await editPost(postId, editPostTitle.trim(), editPostBody.trim());
        if (success) {
            setEditingPost(null);
            setEditPostTitle('');
            setEditPostBody('');
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Delete this post?')) return;
        await deletePost(postId);
    };

    const canModifyPost = (authorId: string) => {
        return user?.id === authorId || circleAdmin;
    };

    return (
        <div className="page-container" style={{ maxWidth: 640 }}>
            {/* Header */}
            <button
                onClick={() => navigate('/circles')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    marginBottom: 16,
                    fontSize: 14
                }}
            >
                <ArrowLeft size={16} /> Back to Circles
            </button>

            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>{circle.name}</h1>
                    {joined ? (
                        <button
                            onClick={() => leaveCircle(circle.id)}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                background: 'transparent',
                                color: '#888',
                                fontSize: 13,
                                cursor: 'pointer'
                            }}
                        >
                            Leave
                        </button>
                    ) : (
                        <button
                            onClick={() => joinCircle(circle.id)}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: 13 }}
                        >
                            Join Circle
                        </button>
                    )}
                </div>
                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{circle.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} /> {circle.memberCount} members
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {circle.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: 11,
                                color: '#8b5cf6',
                                background: 'rgba(139, 92, 246, 0.1)',
                                padding: '2px 8px',
                                borderRadius: 10
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Post */}
            {joined && (
                <div style={{ marginBottom: 20 }}>
                    {showPostEditor ? (
                        <div className="card">
                            <input
                                type="text"
                                placeholder="Post title"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="text-input"
                                style={{ fontWeight: 600 }}
                            />
                            <textarea
                                placeholder="What's on your mind?"
                                value={postBody}
                                onChange={(e) => setPostBody(e.target.value)}
                                className="text-input"
                                rows={4}
                            />
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleCreatePost}
                                    disabled={!postTitle.trim() || !postBody.trim()}
                                    style={{ flex: 1 }}
                                >
                                    Post
                                </button>
                                <button
                                    onClick={() => setShowPostEditor(false)}
                                    style={{
                                        padding: 12,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8,
                                        background: 'transparent',
                                        color: '#666',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowPostEditor(true)}
                            className="card"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                cursor: 'pointer',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                color: '#888'
                            }}
                        >
                            <Plus size={18} />
                            Create a post...
                        </button>
                    )}
                </div>
            )}

            {/* Posts */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>Posts</h2>
            {posts.length === 0 ? (
                <EmptyState
                    icon={<MessageCircle size={28} color="#8b5cf6" />}
                    title="No posts yet"
                    description={joined ? "Be the first to start a conversation!" : "Join the circle to see and create posts."}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {posts.map(post => {
                        const isExpanded = expandedPost === post.id;
                        const isEditing = editingPost === post.id;

                        return (
                            <div key={post.id} className="card" style={{ padding: 20 }}>
                                {isEditing ? (
                                    // Edit mode
                                    <div>
                                        <input
                                            type="text"
                                            value={editPostTitle}
                                            onChange={(e) => setEditPostTitle(e.target.value)}
                                            className="text-input"
                                            placeholder="Post title"
                                        />
                                        <textarea
                                            value={editPostBody}
                                            onChange={(e) => setEditPostBody(e.target.value)}
                                            className="text-input"
                                            placeholder="Post body"
                                            rows={4}
                                        />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleEditPost(post.id)}
                                                className="btn-primary"
                                                style={{ padding: '8px 16px', fontSize: 13 }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingPost(null);
                                                    setEditPostTitle('');
                                                    setEditPostBody('');
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'transparent',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 8,
                                                    color: '#666',
                                                    cursor: 'pointer',
                                                    fontSize: 13
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{post.title}</h3>
                                            {canModifyPost(post.authorId) && (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPost(post.id);
                                                            setEditPostTitle(post.title);
                                                            setEditPostBody(post.body);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#666',
                                                            cursor: 'pointer',
                                                            padding: 4
                                                        }}
                                                        title="Edit post"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: 4
                                                        }}
                                                        title="Delete post"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{post.body}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#666' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span>by {post.authorName}</span>
                                                {post.authorId !== user?.id && (
                                                    (() => {
                                                        const status = getFriendshipStatus(post.authorId);
                                                        if (status === 'none') return (
                                                            <button
                                                                onClick={() => sendFriendRequest(post.authorId)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 4,
                                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                                    border: 'none',
                                                                    borderRadius: 12,
                                                                    color: '#a78bfa',
                                                                    cursor: 'pointer',
                                                                    padding: '2px 8px',
                                                                    fontSize: 10
                                                                }}
                                                            >
                                                                <UserPlus size={10} /> Add Friend
                                                            </button>
                                                        );
                                                        if (status === 'pending_sent') return (
                                                            <span style={{ fontSize: 10, color: '#f59e0b' }}>(Requested)</span>
                                                        );
                                                        if (status === 'friends') return (
                                                            <span style={{ fontSize: 10, color: '#10b981' }}>(Friend)</span>
                                                        );
                                                        return null;
                                                    })()
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#8b5cf6',
                                                    cursor: 'pointer',
                                                    fontSize: 12
                                                }}
                                            >
                                                <MessageCircle size={14} /> {post.commentCount} comments
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Comments section */}
                                {isExpanded && !isEditing && (
                                    <CommentsSection
                                        postId={post.id}
                                        joined={joined}
                                        isCircleAdmin={circleAdmin}
                                        currentUserId={user?.id}
                                        getComments={getComments}
                                        addComment={addComment}
                                        editComment={editComment}
                                        deleteComment={deleteComment}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
