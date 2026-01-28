import { Search, Users, Hash } from 'lucide-react';

export const ExplorePage = () => {
    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <h1 className="page-title">Explore</h1>
            <p className="page-subtitle">Discover circles and communities</p>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                    type="text"
                    placeholder="Search circles, tags..."
                    className="text-input"
                    style={{ paddingLeft: 44, marginBottom: 0 }}
                />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>Popular Tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['anxiety', 'mindfulness', 'productivity', 'wellness', 'support', 'mental-health'].map(tag => (
                        <span key={tag} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: 20,
                            fontSize: 13,
                            color: '#a78bfa',
                            cursor: 'pointer'
                        }}>
                            <Hash size={12} />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Placeholder */}
            <div className="card" style={{ textAlign: 'center', padding: 48, color: '#666' }}>
                <Users size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <p style={{ fontSize: 18, marginBottom: 8 }}>Circles Coming Soon</p>
                <p style={{ fontSize: 14 }}>Community features are being built. Check back soon!</p>
            </div>
        </div>
    );
};
