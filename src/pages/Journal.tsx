import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Lock, Globe, Users } from 'lucide-react';

interface JournalEntry {
    id: string;
    userId: string;
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

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('mindbridge_journals') || '[]');
        setEntries(saved.filter((e: JournalEntry) => e.userId === user?.id));
    }, [user?.id]);

    const handleSave = () => {
        if (!title.trim() || !body.trim() || !user) return;

        const newEntry: JournalEntry = {
            id: crypto.randomUUID(),
            userId: user.id,
            title: title.trim(),
            body: body.trim(),
            visibility,
            createdAt: new Date().toISOString(),
        };

        const allEntries = JSON.parse(localStorage.getItem('mindbridge_journals') || '[]');
        allEntries.unshift(newEntry);
        localStorage.setItem('mindbridge_journals', JSON.stringify(allEntries));

        setEntries([newEntry, ...entries]);
        setShowEditor(false);
        setTitle('');
        setBody('');
    };

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
                            onClick={handleSave}
                            disabled={!title.trim() || !body.trim()}
                            style={{ flex: 1 }}
                        >
                            Save Entry
                        </button>
                        <button
                            onClick={() => setShowEditor(false)}
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
                <div className="card" style={{ textAlign: 'center', padding: 48, color: '#666' }}>
                    <BookOpen size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                    <p style={{ fontSize: 18, marginBottom: 8 }}>No entries yet</p>
                    <p style={{ fontSize: 14 }}>Start journaling to see your entries here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {entries.map((entry) => (
                        <div key={entry.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{entry.title}</h3>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 11,
                                    color: entry.visibility === 'private' ? '#888' : '#8b5cf6',
                                    background: entry.visibility === 'private' ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.1)',
                                    padding: '3px 8px',
                                    borderRadius: 12
                                }}>
                                    {entry.visibility === 'private' ? <Lock size={10} /> : <Globe size={10} />}
                                    {entry.visibility}
                                </span>
                            </div>
                            <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                                {entry.body.length > 200 ? entry.body.substring(0, 200) + '...' : entry.body}
                            </p>
                            <p style={{ fontSize: 12, color: '#555' }}>
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
