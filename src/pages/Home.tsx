import { useNavigate } from 'react-router-dom';
import { Smile, BookOpen, Users, ArrowRight } from 'lucide-react';

export const Home = () => {
    const navigate = useNavigate();

    const features = [
        { path: '/mood', icon: Smile, label: 'Track Mood', desc: 'Log your daily emotions', color: '#8b5cf6' },
        { path: '/journal', icon: BookOpen, label: 'Journal', desc: 'Write your thoughts', color: '#ec4899' },
        { path: '/circles', icon: Users, label: 'Circles', desc: 'Join communities', color: '#06b6d4' },
    ];

    return (
        <div className="page-container" style={{ maxWidth: 600, textAlign: 'center' }}>
            {/* Hero */}
            <div style={{ marginBottom: 48 }}>
                <h1 className="page-title" style={{ fontSize: 42 }}>MindBridge</h1>
                <p className="page-subtitle" style={{ fontSize: 18 }}>
                    Your sanctuary for reflection, connection, and growth.
                </p>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/mood')}
                    style={{ marginTop: 24, padding: '14px 32px', fontSize: 16 }}
                >
                    Get Started <ArrowRight size={18} style={{ marginLeft: 8, verticalAlign: 'middle' }} />
                </button>
            </div>

            {/* Feature Cards */}
            <div style={{ display: 'grid', gap: 16 }}>
                {features.map((f) => {
                    const Icon = f.icon;
                    return (
                        <div
                            key={f.path}
                            className="card"
                            onClick={() => navigate(f.path)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: f.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Icon size={24} color="white" />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{f.label}</h3>
                                <p style={{ fontSize: 14, color: '#a0a0b0' }}>{f.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quote */}
            <div className="card" style={{ marginTop: 48, textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontStyle: 'italic', color: '#d0d0e0', marginBottom: 12 }}>
                    "The only journey is the one within."
                </p>
                <p style={{ fontSize: 14, color: '#666' }}>— Rainer Maria Rilke</p>
            </div>
        </div>
    );
};
