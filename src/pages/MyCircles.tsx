import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCircles } from '../context/CircleContext';
import { useFriends } from '../context/FriendsContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import {
    Settings, UserMinus, Shield, ShieldOff,
    Check, X, ChevronDown, ChevronUp, Edit2, ArrowRight, UserPlus
} from 'lucide-react';
import type { Circle } from '../types';

interface CircleMember {
    userId: string;
    username: string;
    displayName: string;
    role: 'admin' | 'member';
    status: 'active' | 'pending';
    joinedAt: string;
}

export const MyCirclesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        adminCircles,
        getCircleMembers,
        getPendingRequests,
        approveRequest,
        rejectRequest,
        removeMember,
        promoteMember,
        demoteMember,
        updateCircle
    } = useCircles();
    const { sendFriendRequest, getFriendshipStatus } = useFriends();

    const [expandedCircle, setExpandedCircle] = useState<string | null>(null);
    const [members, setMembers] = useState<CircleMember[]>([]);
    const [pendingRequests, setPendingRequests] = useState<CircleMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingCircle, setEditingCircle] = useState<Circle | null>(null);

    // Load members when a circle is expanded
    useEffect(() => {
        const loadData = async () => {
            if (!expandedCircle) return;
            setIsLoading(true);
            const [memberData, pendingData] = await Promise.all([
                getCircleMembers(expandedCircle),
                getPendingRequests(expandedCircle)
            ]);
            setMembers(memberData);
            setPendingRequests(pendingData);
            setIsLoading(false);
        };
        loadData();
    }, [expandedCircle, getCircleMembers, getPendingRequests]);

    const handleApprove = async (circleId: string, userId: string) => {
        await approveRequest(circleId, userId);
        setPendingRequests(prev => prev.filter(r => r.userId !== userId));
        // Refresh members
        const newMembers = await getCircleMembers(circleId);
        setMembers(newMembers);
    };

    const handleReject = async (circleId: string, userId: string) => {
        await rejectRequest(circleId, userId);
        setPendingRequests(prev => prev.filter(r => r.userId !== userId));
    };

    const handleRemove = async (circleId: string, userId: string) => {
        if (confirm('Remove this member from the circle?')) {
            await removeMember(circleId, userId);
            setMembers(prev => prev.filter(m => m.userId !== userId));
        }
    };

    const handlePromote = async (circleId: string, userId: string) => {
        await promoteMember(circleId, userId);
        setMembers(prev => prev.map(m =>
            m.userId === userId ? { ...m, role: 'admin' as const } : m
        ));
    };

    const handleDemote = async (circleId: string, userId: string) => {
        await demoteMember(circleId, userId);
        setMembers(prev => prev.map(m =>
            m.userId === userId ? { ...m, role: 'member' as const } : m
        ));
    };

    const handleAddFriend = async (userId: string) => {
        await sendFriendRequest(userId);
    };

    return (
        <div className="page-container" style={{ maxWidth: 640 }}>
            <h1 className="page-title">My Circles</h1>
            <p className="page-subtitle">Manage circles you administer</p>

            {adminCircles.length === 0 ? (
                <EmptyState
                    icon={<Settings size={28} color="#8b5cf6" />}
                    title="No circles to manage"
                    description="Create a circle to start managing your community."
                    action={
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/circles')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            Go to Circles <ArrowRight size={16} />
                        </button>
                    }
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {adminCircles.map(circle => {
                        const isExpanded = expandedCircle === circle.id;

                        return (
                            <div key={circle.id} className="card" style={{ overflow: 'hidden' }}>
                                {/* Circle Header */}
                                <div
                                    style={{
                                        padding: 20,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => setExpandedCircle(isExpanded ? null : circle.id)}
                                >
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                                            {circle.name}
                                        </h3>
                                        <p style={{ fontSize: 13, color: '#888' }}>
                                            {circle.memberCount} members · {circle.visibility}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCircle(circle);
                                            }}
                                            style={{
                                                padding: 8,
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                border: 'none',
                                                borderRadius: 8,
                                                color: '#a78bfa',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {isExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                                    </div>
                                </div>

                                {/* Expanded Admin Panel */}
                                {isExpanded && (
                                    <div style={{
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        padding: 20
                                    }}>
                                        {isLoading ? (
                                            <div style={{ textAlign: 'center', color: '#666', padding: 20 }}>
                                                Loading...
                                            </div>
                                        ) : (
                                            <>
                                                {/* Pending Requests */}
                                                {pendingRequests.length > 0 && (
                                                    <div style={{ marginBottom: 24 }}>
                                                        <h4 style={{ fontSize: 14, color: '#f59e0b', marginBottom: 12 }}>
                                                            Pending Requests ({pendingRequests.length})
                                                        </h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            {pendingRequests.map(request => (
                                                                <div
                                                                    key={request.userId}
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: 12,
                                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                                        borderRadius: 8
                                                                    }}
                                                                >
                                                                    <span style={{ color: '#fff' }}>{request.displayName}</span>
                                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                                        <button
                                                                            onClick={() => handleApprove(circle.id, request.userId)}
                                                                            style={{
                                                                                padding: '6px 12px',
                                                                                background: 'rgba(16, 185, 129, 0.2)',
                                                                                border: 'none',
                                                                                borderRadius: 6,
                                                                                color: '#10b981',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 4,
                                                                                fontSize: 12
                                                                            }}
                                                                        >
                                                                            <Check size={14} /> Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleReject(circle.id, request.userId)}
                                                                            style={{
                                                                                padding: '6px 12px',
                                                                                background: 'rgba(239, 68, 68, 0.2)',
                                                                                border: 'none',
                                                                                borderRadius: 6,
                                                                                color: '#ef4444',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 4,
                                                                                fontSize: 12
                                                                            }}
                                                                        >
                                                                            <X size={14} /> Reject
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Members List */}
                                                <div>
                                                    <h4 style={{ fontSize: 14, color: '#a0a0b0', marginBottom: 12 }}>
                                                        Members ({members.length})
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {members.map(member => (
                                                            <div
                                                                key={member.userId}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    padding: 12,
                                                                    background: 'rgba(255,255,255,0.03)',
                                                                    borderRadius: 8
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <span style={{ color: '#fff' }}>{member.displayName}</span>
                                                                    {member.role === 'admin' && (
                                                                        <span style={{
                                                                            fontSize: 10,
                                                                            padding: '2px 6px',
                                                                            background: 'rgba(139, 92, 246, 0.2)',
                                                                            color: '#a78bfa',
                                                                            borderRadius: 4
                                                                        }}>
                                                                            Admin
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: 6 }}>
                                                                    {/* Add Friend Button */}
                                                                    {member.userId !== user?.id && (
                                                                        (() => {
                                                                            const status = getFriendshipStatus(member.userId);
                                                                            if (status === 'friends') return (
                                                                                <span style={{
                                                                                    fontSize: 11,
                                                                                    color: '#10b981',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                                                    padding: '4px 8px',
                                                                                    borderRadius: 6
                                                                                }}>
                                                                                    Friends
                                                                                </span>
                                                                            );
                                                                            if (status === 'pending_sent') return (
                                                                                <span style={{
                                                                                    fontSize: 11,
                                                                                    color: '#f59e0b',
                                                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                                                    padding: '4px 8px',
                                                                                    borderRadius: 6
                                                                                }}>
                                                                                    Requested
                                                                                </span>
                                                                            );
                                                                            if (status === 'pending_received') return (
                                                                                <button
                                                                                    onClick={() => navigate('/friends')}
                                                                                    style={{
                                                                                        padding: '4px 8px',
                                                                                        background: 'rgba(139, 92, 246, 0.2)',
                                                                                        border: 'none',
                                                                                        borderRadius: 6,
                                                                                        color: '#a78bfa',
                                                                                        cursor: 'pointer',
                                                                                        fontSize: 11
                                                                                    }}
                                                                                >
                                                                                    Accept Request
                                                                                </button>
                                                                            );
                                                                            return (
                                                                                <button
                                                                                    onClick={() => handleAddFriend(member.userId)}
                                                                                    title="Add Friend"
                                                                                    style={{
                                                                                        padding: 6,
                                                                                        background: 'transparent',
                                                                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                                                                        borderRadius: 6,
                                                                                        color: '#a78bfa',
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                >
                                                                                    <UserPlus size={14} />
                                                                                </button>
                                                                            );
                                                                        })()
                                                                    )}

                                                                    {member.role === 'member' ? (
                                                                        <button
                                                                            onClick={() => handlePromote(circle.id, member.userId)}
                                                                            title="Promote to admin"
                                                                            style={{
                                                                                padding: 6,
                                                                                background: 'transparent',
                                                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                                                borderRadius: 6,
                                                                                color: '#a78bfa',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            <Shield size={14} />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleDemote(circle.id, member.userId)}
                                                                            title="Remove admin"
                                                                            style={{
                                                                                padding: 6,
                                                                                background: 'transparent',
                                                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                                                borderRadius: 6,
                                                                                color: '#666',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            <ShieldOff size={14} />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleRemove(circle.id, member.userId)}
                                                                        title="Remove member"
                                                                        style={{
                                                                            padding: 6,
                                                                            background: 'transparent',
                                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                            borderRadius: 6,
                                                                            color: '#ef4444',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <UserMinus size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* View Circle Button */}
                                                <button
                                                    onClick={() => navigate(`/circles/${circle.id}`)}
                                                    className="btn-primary"
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 6
                                                    }}
                                                >
                                                    View Circle <ArrowRight size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Circle Modal */}
            {editingCircle && (
                <EditCircleModal
                    circle={editingCircle}
                    onClose={() => setEditingCircle(null)}
                    onSave={updateCircle}
                />
            )}
        </div>
    );
};

// Edit Circle Modal Component
const EditCircleModal = ({
    circle,
    onClose,
    onSave
}: {
    circle: Circle;
    onClose: () => void;
    onSave: (circleId: string, updates: Partial<Pick<Circle, 'name' | 'description' | 'tags' | 'visibility'>>) => Promise<boolean>;
}) => {
    const [name, setName] = useState(circle.name);
    const [description, setDescription] = useState(circle.description);
    const [tags, setTags] = useState(circle.tags.join(', '));
    const [visibility, setVisibility] = useState<'public' | 'private'>(circle.visibility);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        await onSave(circle.id, {
            name,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            visibility
        });
        setIsLoading(false);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
        }}>
            <div className="card" style={{ maxWidth: 480, width: '100%' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Edit Circle</h2>

                <input
                    type="text"
                    placeholder="Circle name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-input"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-input"
                    rows={3}
                />
                <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="text-input"
                />

                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <button
                        onClick={() => setVisibility('public')}
                        style={{
                            flex: 1,
                            padding: 10,
                            border: visibility === 'public' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            background: visibility === 'public' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: visibility === 'public' ? '#10b981' : '#666',
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        Public
                    </button>
                    <button
                        onClick={() => setVisibility('private')}
                        style={{
                            flex: 1,
                            padding: 10,
                            border: visibility === 'private' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            background: visibility === 'private' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: visibility === 'private' ? '#a78bfa' : '#666',
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        Private
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={!name.trim() || isLoading}
                        style={{ flex: 1 }}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            padding: 12,
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            background: 'transparent',
                            color: '#666',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
