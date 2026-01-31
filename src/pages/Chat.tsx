import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useFriends } from '../context/FriendsContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, User } from 'lucide-react';

export const ChatPage = () => {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { friends } = useFriends();
    const { messages, isLoading, sendMessage, loadMessages } = useChat();
    const [content, setContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const friend = friends.find(f =>
        (f.requesterId === friendId || f.addresseeId === friendId)
    );

    const friendName = friend
        ? (friend.requesterId === user?.id ? friend.addresseeName : friend.requesterName)
        : 'Unknown Friend';

    useEffect(() => {
        if (friendId) {
            loadMessages(friendId);
        }
    }, [friendId, loadMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !friendId) return;

        const success = await sendMessage(friendId, content);
        if (success) {
            setContent('');
        }
    };

    if (!friendId) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#666' }}>Select a friend to start chatting</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 16
            }}>
                <button
                    onClick={() => navigate('/friends')}
                    style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600
                }}>
                    {friendName.charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white', margin: 0 }}>{friendName}</h2>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: 20 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: 40, marginTop: 'auto' }}>
                        No messages yet. Send a greeting!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: 16,
                                    borderBottomRightRadius: isMine ? 4 : 16,
                                    borderBottomLeftRadius: isMine ? 16 : 4,
                                    background: isMine ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                                    color: isMine ? 'white' : '#ccc',
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {msg.content}
                                <div style={{
                                    fontSize: 10,
                                    color: isMine ? 'rgba(255,255,255,0.7)' : '#666',
                                    marginTop: 4,
                                    textAlign: 'right'
                                }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '16px 0' }}>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="text-input"
                    style={{ margin: 0, flex: 1 }}
                />
                <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: 48, height: 48, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    disabled={!content.trim()}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};
