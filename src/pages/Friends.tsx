import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '../context/FriendsContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { Users, UserPlus, UserMinus, Check, X, Clock, MessageCircle } from 'lucide-react';

type Tab = 'friends' | 'requests' | 'sent';

export const FriendsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        friends,
        pendingRequests,
        sentRequests,
        isLoading,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeFriend
    } = useFriends();

    const [activeTab, setActiveTab] = useState<Tab>('friends');

    if (!user) {
        return (
            <div className="page-container">
                <EmptyState
                    icon={<Users size={28} color="#8b5cf6" />}
                    title="Sign in to see friends"
                    description="Create an account to connect with others."
                />
            </div>
        );
    }

    const TabButton = ({ tab, label, count }: { tab: Tab; label: string; count: number }) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                flex: 1,
                padding: '12px 16px',
                background: activeTab === tab ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
                color: activeTab === tab ? '#a78bfa' : '#666',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
            }}
        >
            {label}
            {count > 0 && (
                <span style={{
                    background: activeTab === tab ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                    color: activeTab === tab ? 'white' : '#888',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12
                }}>
                    {count}
                </span>
            )}
        </button>
    );

    const handleAccept = async (friendshipId: string) => {
        await acceptRequest(friendshipId);
    };

    const handleReject = async (friendshipId: string) => {
        await rejectRequest(friendshipId);
    };

    const handleCancel = async (friendshipId: string) => {
        await cancelRequest(friendshipId);
    };

    const handleRemove = async (friendshipId: string) => {
        if (confirm('Remove this friend?')) {
            await removeFriend(friendshipId);
        }
    };

    const getFriendName = (friendship: typeof friends[0]) => {
        return friendship.requesterId === user.id ? friendship.addresseeName : friendship.requesterName;
    };

    const getFriendId = (friendship: typeof friends[0]) => {
        return friendship.requesterId === user.id ? friendship.addresseeId : friendship.requesterId;
    };

    return (
        <div className="page-container" style={{ maxWidth: 640 }}>
            <h1 className="page-title">Friends</h1>
            <p className="page-subtitle">Connect with people from your circles</p>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 24
            }}>
                <TabButton tab="friends" label="Friends" count={friends.length} />
                <TabButton tab="requests" label="Requests" count={pendingRequests.length} />
                <TabButton tab="sent" label="Sent" count={sentRequests.length} />
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>Loading...</div>
            ) : (
                <>
                    {/* Friends Tab */}
                    {activeTab === 'friends' && (
                        friends.length === 0 ? (
                            <EmptyState
                                icon={<Users size={28} color="#8b5cf6" />}
                                title="No friends yet"
                                description="Join circles and connect with people who share your interests!"
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {friends.map(friendship => (
                                    <div
                                        key={friendship.id}
                                        className="card"
                                        style={{
                                            padding: 16,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: 16
                                            }}>
                                                {getFriendName(friendship).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'white' }}>
                                                    {getFriendName(friendship)}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#666' }}>
                                                    Friends since {new Date(friendship.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => navigate(`/chat/${getFriendId(friendship)}`)}
                                                title="Message"
                                                style={{
                                                    padding: 8,
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    color: '#a78bfa',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleRemove(friendship.id)}
                                                title="Remove friend"
                                                style={{
                                                    padding: 8,
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    color: '#ef4444',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <UserMinus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        pendingRequests.length === 0 ? (
                            <EmptyState
                                icon={<UserPlus size={28} color="#8b5cf6" />}
                                title="No pending requests"
                                description="When someone wants to be your friend, you'll see their request here."
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {pendingRequests.map(request => (
                                    <div
                                        key={request.id}
                                        className="card"
                                        style={{
                                            padding: 16,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: 16
                                            }}>
                                                {request.requesterName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'white' }}>
                                                    {request.requesterName}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#666' }}>
                                                    Sent {new Date(request.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleAccept(request.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    color: '#10b981',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    fontSize: 13
                                                }}
                                            >
                                                <Check size={14} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    fontSize: 13
                                                }}
                                            >
                                                <X size={14} /> Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Sent Tab */}
                    {activeTab === 'sent' && (
                        sentRequests.length === 0 ? (
                            <EmptyState
                                icon={<Clock size={28} color="#8b5cf6" />}
                                title="No sent requests"
                                description="Send friend requests to people you meet in circles."
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {sentRequests.map(request => (
                                    <div
                                        key={request.id}
                                        className="card"
                                        style={{
                                            padding: 16,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: 16
                                            }}>
                                                {request.addresseeName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'white' }}>
                                                    {request.addresseeName}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={12} /> Pending
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancel(request.id)}
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
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};
