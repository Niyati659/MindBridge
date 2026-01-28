import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, LogOut, X, Plus } from 'lucide-react';

export const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [interests, setInterests] = useState<string[]>(user?.interests || []);
    const [newInterest, setNewInterest] = useState('');
    const [saved, setSaved] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSave = () => {
        updateProfile({ displayName, bio, interests });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addInterest = () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim().toLowerCase())) {
            setInterests([...interests, newInterest.trim().toLowerCase()]);
            setNewInterest('');
        }
    };

    const removeInterest = (tag: string) => {
        setInterests(interests.filter(i => i !== tag));
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="page-container" style={{ maxWidth: 500 }}>
            <h1 className="page-title">Your Profile</h1>
            <p className="page-subtitle">Manage your account settings</p>

            <div className="card" style={{ marginBottom: 20 }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        fontWeight: 700,
                        color: 'white'
                    }}>
                        {displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 18 }}>@{user.username}</p>
                        <p style={{ color: '#666', fontSize: 14 }}>{user.email}</p>
                    </div>
                </div>

                {/* Display Name */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0b0' }}>
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="text-input"
                        style={{ marginBottom: 0 }}
                    />
                </div>

                {/* Bio */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0b0' }}>
                        Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="text-input"
                        rows={3}
                        style={{ marginBottom: 0 }}
                    />
                </div>

                {/* Interests */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0b0' }}>
                        Interests / Tags
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {interests.map(tag => (
                            <span key={tag} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 12px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                borderRadius: 20,
                                fontSize: 13,
                                color: '#a78bfa'
                            }}>
                                #{tag}
                                <button
                                    onClick={() => removeInterest(tag)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    <X size={14} color="#a78bfa" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                            placeholder="Add interest (e.g., mindfulness)"
                            className="text-input"
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button onClick={addInterest} className="btn-primary" style={{ padding: '10px 16px' }}>
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                    <Save size={18} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                style={{
                    width: '100%',
                    padding: 14,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 12,
                    color: '#f87171',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}
            >
                <LogOut size={18} />
                Sign Out
            </button>
        </div>
    );
};
