import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCircles } from '../context/CircleContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { ArrowLeft, Users, MessageCircle, Send, Plus } from 'lucide-react';
import type { Circle } from '../types';

export const CircleDetailPage = () => {
    const { circleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { circles, isJoined, joinCircle, leaveCircle, getCirclePosts, createPost, addComment, getComments } = useCircles();

    const [circle, setCircle] = useState<Circle | null>(null);
    const [showPostEditor, setShowPostEditor] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const found = circles.find(c => c.id === circleId);
        setCircle(found || null);
    }, [circles, circleId]);

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

    const handleCreatePost = () => {
        if (!postTitle.trim() || !postBody.trim()) return;
        createPost(circle.id, postTitle.trim(), postBody.trim());
        setPostTitle('');
        setPostBody('');
        setShowPostEditor(false);
    };

    const handleAddComment = (postId: string) => {
        if (!commentText.trim()) return;
        addComment(postId, commentText.trim());
        setCommentText('');
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
                        const comments = getComments(post.id);
                        const isExpanded = expandedPost === post.id;

                        return (
                            <div key={post.id} className="card" style={{ padding: 20 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{post.title}</h3>
                                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{post.body}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#666' }}>
                                    <span>by {post.authorName}</span>
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

                                {/* Comments section */}
                                {isExpanded && (
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
                                                    <span style={{ color: '#555' }}>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#ccc', fontSize: 13 }}>{comment.body}</p>
                                            </div>
                                        ))}

                                        {joined && (
                                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                                <input
                                                    type="text"
                                                    placeholder="Add a comment..."
                                                    value={expandedPost === post.id ? commentText : ''}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    className="text-input"
                                                    style={{ marginBottom: 0, flex: 1 }}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                                />
                                                <button
                                                    onClick={() => handleAddComment(post.id)}
                                                    className="btn-primary"
                                                    style={{ padding: '10px 14px' }}
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
