import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, type JournalRow } from '../lib/supabase';
import { BookOpen, Plus, Lock, Globe, Loader2 } from 'lucide-react';

interface JournalEntry {
    id: string;
    title: string;
    body: string;
    visibility: 'private' | 'circle' | 'public';
    createdAt: string;
}

export const JournalPage = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadEntries = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const { data } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setEntries(data.map((row: JournalRow) => ({
                id: row.id,
                title: row.title,
                body: row.body,
                visibility: row.visibility,
                createdAt: row.created_at,
            })));
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    const handleSave = async () => {
        if (!title.trim() || !body.trim() || !user) return;
        setIsSaving(true);

        const { error } = await supabase
            .from('journals')
            .insert({
                user_id: user.id,
                title: title.trim(),
                body: body.trim(),
                visibility,
            });

        if (!error) {
            await loadEntries();
            setShowEditor(false);
            setTitle('');
            setBody('');
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="page-container" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 100 }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12, color: '#888' }}>Loading journal...</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title">Journal</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Write your thoughts</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowEditor(!showEditor)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <Plus size={18} />
                    New Entry
                </button>
            </div>

            {/* Editor */}
            {showEditor && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Entry title..."
                        className="text-input"
                        style={{ marginBottom: 12, fontWeight: 600, fontSize: 18 }}
                    />
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="What's on your mind?"
                        className="text-input"
                        rows={6}
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

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className="btn-primary"
                            style={{ flex: 1 }}
                            disabled={!title.trim() || !body.trim() || isSaving}
                            onClick={handleSave}
                        >
                            {isSaving ? 'Saving...' : 'Save Entry'}
                        </button>
                        <button
                            onClick={() => { setShowEditor(false); setTitle(''); setBody(''); }}
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
            )}

            {/* Entries List */}
            {entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    <BookOpen size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
                    <p>No journal entries yet.</p>
                    <p style={{ fontSize: 13 }}>Click "New Entry" to write your first one!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {entries.map(entry => (
                        <div key={entry.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{entry.title}</h3>
                                <span style={{ fontSize: 12, color: '#555' }}>
                                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {entry.body.length > 200 ? entry.body.substring(0, 200) + '...' : entry.body}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#666' }}>
                                {entry.visibility === 'private' ? <Lock size={12} /> : <Globe size={12} />}
                                {entry.visibility}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
