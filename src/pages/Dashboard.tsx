import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Smile, BookOpen, Users, ChevronRight, Sparkles } from 'lucide-react';
import { MoodChart } from '../components/features/MoodChart';
import type { MoodLog } from '../types';

interface RawMoodLog extends MoodLog {
    userId: string;
}

export const Dashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    // Wait for auth to finish loading
    if (isLoading) {
        return (
            <div className="page-container" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 100 }}>
                <p style={{ color: '#a0a0b0' }}>Loading...</p>
            </div>
        );
    }

    // Only redirect if auth is done loading and no user
    if (!user) {
        // Use useEffect for navigation side effects, but for now just render redirect message
        return (
            <div className="page-container" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 100 }}>
                <p style={{ color: '#a0a0b0' }}>Redirecting to login...</p>
            </div>
        );
    }

    // Get mood logs
    const today = new Date().toISOString().split('T')[0];
    const allMoodLogs: RawMoodLog[] = JSON.parse(localStorage.getItem('mindbridge_mood_logs') || '[]');
    const userMoods = allMoodLogs.filter(log => log.userId === user.id);
    const todayMood = userMoods.find(log => log.date === today);

    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            {/* Welcome Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, marginBottom: 8 }}>
                    Welcome back, <span style={{ color: '#a78bfa' }}>{user.displayName || user.username}</span>
                </h1>
                <p style={{ color: '#a0a0b0' }}>Here's what's happening in your sanctuary.</p>
            </div>

            {/* Mood Prompt */}
            {!todayMood && (
                <div
                    className="card"
                    onClick={() => navigate('/mood')}
                    style={{
                        marginBottom: 20,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Sparkles size={24} color="#a78bfa" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: 4 }}>How are you feeling today?</p>
                                <p style={{ fontSize: 13, color: '#a0a0b0' }}>Take a moment to log your mood</p>
                            </div>
                        </div>
                        <ChevronRight size={20} color="#666" />
                    </div>
                </div>
            )}

            {/* Mood Trends Chart */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>Your Mood Trends</h2>
            <div className="card" style={{ marginBottom: 24, padding: 20 }}>
                <MoodChart moods={userMoods} />
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                <ActionCard
                    icon={<Smile size={22} color="white" />}
                    iconBg="#8b5cf6"
                    title="Mood Tracker"
                    desc="Log your daily emotions"
                    onClick={() => navigate('/mood')}
                />
                <ActionCard
                    icon={<BookOpen size={22} color="white" />}
                    iconBg="#ec4899"
                    title="Journal"
                    desc="Write your thoughts"
                    onClick={() => navigate('/journal')}
                />
                <ActionCard
                    icon={<Users size={22} color="white" />}
                    iconBg="#06b6d4"
                    title="Circles"
                    desc="Connect with communities"
                    onClick={() => navigate('/circles')}
                />
            </div>

            {/* Recommended Circles */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#a0a0b0' }}>
                Recommended for You
            </h2>
            <div className="card" style={{ textAlign: 'center', padding: 32, color: '#666' }}>
                <Users size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
                <p>No recommendations yet.</p>
                <p style={{ fontSize: 13 }}>Add interests to your profile to get personalized suggestions.</p>
                <Link
                    to="/profile"
                    style={{ color: '#8b5cf6', fontSize: 14, marginTop: 12, display: 'inline-block' }}
                >
                    Update Profile →
                </Link>
            </div>
        </div>
    );
};

// Helper component
const ActionCard = ({ icon, iconBg, title, desc, onClick }: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    desc: string;
    onClick: () => void;
}) => (
    <div
        className="card"
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            padding: 16
        }}
    >
        <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>{title}</p>
            <p style={{ fontSize: 13, color: '#666' }}>{desc}</p>
        </div>
        <ChevronRight size={18} color="#666" />
    </div>
);
