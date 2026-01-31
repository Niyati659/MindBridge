import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, type MoodLogRow } from '../lib/supabase';
import { Frown, Meh, Smile, Clock, Calendar, Lock, Globe, Loader2 } from 'lucide-react';

interface MoodLog {
    id: string;
    mood: 'good' | 'neutral' | 'bad';
    note: string | null;
    date: string;
    visibility: 'private' | 'public';
    createdAt: string;
}

const moods = [
    { value: 'bad' as const, icon: Frown, label: 'Bad Day', color: '#ef4444' },
    { value: 'neutral' as const, icon: Meh, label: 'Neutral', color: '#eab308' },
    { value: 'good' as const, icon: Smile, label: 'Good Day', color: '#22c55e' },
];

export const MoodTrackerPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [selectedMood, setSelectedMood] = useState<'good' | 'neutral' | 'bad' | null>(null);
    const [note, setNote] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const loadLogs = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const { data } = await supabase
            .from('mood_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30);

        if (data) {
            const mappedLogs = data.map((row: MoodLogRow) => ({
                id: row.id,
                mood: row.mood,
                note: row.note,
                date: row.date,
                visibility: row.visibility,
                createdAt: row.created_at,
            }));
            setLogs(mappedLogs);

            // Check if already logged today
            const todayLog = mappedLogs.find(log => log.date === today);
            if (todayLog) {
                setSelectedMood(todayLog.mood);
                setNote(todayLog.note || '');
                setVisibility(todayLog.visibility);
            }
        }
        setIsLoading(false);
    }, [user, today]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const handleSave = async () => {
        if (!selectedMood || !user) return;
        setIsSaving(true);

        // Check if entry exists for today
        const existingLog = logs.find(log => log.date === today);

        if (existingLog) {
            // Update existing
            await supabase
                .from('mood_logs')
                .update({
                    mood: selectedMood,
                    note: note || null,
                    visibility,
                })
                .eq('id', existingLog.id);
        } else {
            // Insert new
            await supabase
                .from('mood_logs')
                .insert({
                    user_id: user.id,
                    mood: selectedMood,
                    note: note || null,
                    visibility,
                    date: today,
                });
        }

        await loadLogs();
        setIsSaving(false);
    };

    const todayLogged = logs.some(log => log.date === today);
    const getMoodInfo = (value: string) => moods.find(m => m.value === value) || moods[1];

    if (isLoading) {
        return (
            <div className="page-container" style={{ maxWidth: 500, textAlign: 'center', paddingTop: 100 }}>
                <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12, color: '#888' }}>Loading moods...</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: 500 }}>
            <h1 className="page-title">Mood Tracker</h1>
            <p className="page-subtitle">How are you feeling today?</p>

            {/* Mood Input Card */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16, fontSize: 16, color: '#a0a0b0' }}>
                    {todayLogged ? "Today's Entry" : "Log Today's Mood"}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    {moods.map((mood) => {
                        const Icon = mood.icon;
                        const isSelected = selectedMood === mood.value;
                        return (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: 16,
                                    border: isSelected ? `2px solid ${mood.color}` : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12,
                                    background: isSelected ? `${mood.color}20` : 'transparent',
                                    color: isSelected ? 'white' : '#666',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={28} color={isSelected ? mood.color : '#888'} />
                                <span style={{ fontSize: 12, fontWeight: 500 }}>{mood.label}</span>
                            </button>
                        );
                    })}
                </div>

                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about your day (optional)..."
                    className="text-input"
                    rows={3}
                />

                {/* Visibility */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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
                    <button
                        onClick={() => setVisibility('public')}
                        style={{
                            flex: 1,
                            padding: 10,
                            border: visibility === 'public' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            background: visibility === 'public' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: visibility === 'public' ? '#a78bfa' : '#666',
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
                </div>

                <button
                    className="btn-primary"
                    style={{ width: '100%' }}
                    disabled={!selectedMood || isSaving}
                    onClick={handleSave}
                >
                    {isSaving ? 'Saving...' : todayLogged ? 'Update Entry' : 'Log Mood'}
                </button>
            </div>

            {/* History */}
            <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 16, color: '#a0a0b0' }}>
                    <Calendar size={18} />
                    Mood History
                </h3>

                {logs.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 32, color: '#666' }}>
                        <Clock size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                        <p>No mood logs yet.</p>
                        <p style={{ fontSize: 13 }}>Start tracking to see your history!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {logs.slice(0, 14).map((log) => {
                            const moodInfo = getMoodInfo(log.mood);
                            const Icon = moodInfo.icon;
                            const isToday = log.date === today;
                            return (
                                <div
                                    key={log.id}
                                    className="card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        padding: 14,
                                        border: isToday ? '1px solid rgba(139, 92, 246, 0.3)' : undefined
                                    }}
                                >
                                    <div style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 10,
                                        background: moodInfo.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon size={18} color="white" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontWeight: 500, fontSize: 14 }}>
                                                {moodInfo.label}
                                                {isToday && <span style={{ color: '#8b5cf6', marginLeft: 6, fontSize: 11 }}>Today</span>}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#555' }}>
                                                {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        {log.note && (
                                            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>{log.note}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
