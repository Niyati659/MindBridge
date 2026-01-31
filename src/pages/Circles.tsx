import { useState } from 'react';
import { useCircles } from '../context/CircleContext';
import { EmptyState } from '../components/common/EmptyState';
import { Users, Plus, Search, Lock, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CirclesPage = () => {
    const navigate = useNavigate();
    const { circles, joinedCircles, isJoined, joinCircle, leaveCircle } = useCircles();
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [activeTab, setActiveTab] = useState<'discover' | 'joined'>('discover');

    const filteredCircles = circles.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="page-container" style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Circles</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Connect with communities</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowCreate(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <Plus size={18} />
                    Create
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                    type="text"
                    placeholder="Search circles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-input"
                    style={{ paddingLeft: 44, marginBottom: 0 }}
                />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('discover')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: 'none',
                        borderRadius: 10,
                        background: activeTab === 'discover' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'discover' ? '#a78bfa' : '#888',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 14,
                    }}
                >
                    Discover
                </button>
                <button
                    onClick={() => setActiveTab('joined')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: 'none',
                        borderRadius: 10,
                        background: activeTab === 'joined' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'joined' ? '#a78bfa' : '#888',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 14,
                    }}
                >
                    Joined ({joinedCircles.length})
                </button>
            </div>

            {/* Circle List */}
            {activeTab === 'discover' ? (
                filteredCircles.length === 0 ? (
                    <EmptyState
                        icon={<Users size={28} color="#8b5cf6" />}
                        title="No circles found"
                        description="Try a different search or create your own circle."
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filteredCircles.map((circle) => (
                            <div
                                key={circle.id}
                                className="card"
                                style={{ padding: 20, cursor: 'pointer' }}
                                onClick={() => navigate(`/circles/${circle.id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{circle.name}</h3>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: 11,
                                        color: circle.visibility === 'private' ? '#888' : '#10b981',
                                        background: circle.visibility === 'private' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)',
                                        padding: '3px 8px',
                                        borderRadius: 12
                                    }}>
                                        {circle.visibility === 'private' ? <Lock size={10} /> : <Globe size={10} />}
                                        {circle.visibility}
                                    </span>
                                </div>
                                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                                    {circle.description.length > 100 ? circle.description.substring(0, 100) + '...' : circle.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {circle.tags.slice(0, 3).map(tag => (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 12, color: '#666' }}>{circle.memberCount} members</span>
                                        {isJoined(circle.id) ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); leaveCircle(circle.id); }}
                                                style={{
                                                    padding: '6px 12px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 8,
                                                    background: 'transparent',
                                                    color: '#888',
                                                    fontSize: 12,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Leave
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); joinCircle(circle.id); }}
                                                className="btn-primary"
                                                style={{ padding: '6px 12px', fontSize: 12 }}
                                            >
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                joinedCircles.length === 0 ? (
                    <EmptyState
                        icon={<Users size={28} color="#8b5cf6" />}
                        title="No circles joined"
                        description="Join a circle from the Discover tab to get started."
                        action={
                            <button
                                className="btn-primary"
                                onClick={() => setActiveTab('discover')}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                Discover Circles <ArrowRight size={16} />
                            </button>
                        }
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {joinedCircles.map((circle) => (
                            <div
                                key={circle.id}
                                className="card"
                                style={{ padding: 20, cursor: 'pointer' }}
                                onClick={() => navigate(`/circles/${circle.id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{circle.name}</h3>
                                        <p style={{ fontSize: 13, color: '#888' }}>{circle.memberCount} members</p>
                                    </div>
                                    <ArrowRight size={18} color="#666" />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Create Modal - simplified inline for now */}
            {showCreate && <CreateCircleModal onClose={() => setShowCreate(false)} />}
        </div>
    );
};

// Create Circle Modal
const CreateCircleModal = ({ onClose }: { onClose: () => void }) => {
    const { createCircle } = useCircles();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim() || !description.trim()) return;
        setIsLoading(true);
        setError('');

        try {
            const result = await createCircle({
                name: name.trim(),
                description: description.trim(),
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                visibility,
            });

            if (result) {
                onClose();
            } else {
                setError('Failed to create circle. Please try again.');
            }
        } catch (err) {
            console.error('Create circle error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Create Circle</h2>

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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            fontSize: 13
                        }}
                    >
                        <Globe size={14} /> Public
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            fontSize: 13
                        }}
                    >
                        <Lock size={14} /> Private
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: 12,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                        marginBottom: 16,
                        color: '#f87171',
                        fontSize: 14
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="btn-primary"
                        onClick={handleCreate}
                        disabled={!name.trim() || !description.trim() || isLoading}
                        style={{ flex: 1 }}
                    >
                        {isLoading ? 'Creating...' : 'Create Circle'}
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
