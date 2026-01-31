import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, AlertTriangle } from 'lucide-react';

const MAX_ATTEMPTS = 3;

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const lockTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLocked) {
            setError('Too many attempts. Please wait 30 seconds.');
            return;
        }

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        const result = await login(email, password);

        if (result.success) {
            setAttempts(0);
            navigate('/dashboard');
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setIsLocked(true);
                setError(`Too many failed attempts. Locked for 30 seconds.`);
                lockTimeRef.current = setTimeout(() => {
                    setIsLocked(false);
                    setAttempts(0);
                    setError('');
                }, 30000);
            } else {
                const remaining = MAX_ATTEMPTS - newAttempts;
                setError(`${result.error || 'Login failed'}. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
            }
        }
        setLoading(false);
    };

    return (
        <div className="page-container" style={{ maxWidth: 400, paddingTop: 80 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 className="page-title">Welcome Back</h1>
                <p className="page-subtitle">Sign in to continue to MindBridge</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: 12,
                            background: isLocked ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: isLocked ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 8,
                            marginBottom: 16,
                            color: isLocked ? '#fbbf24' : '#f87171',
                            fontSize: 14
                        }}>
                            {isLocked ? <AlertTriangle size={16} /> : <AlertCircle size={16} />}
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0b0' }}>
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="text-input"
                                style={{ paddingLeft: 40, marginBottom: 0 }}
                                disabled={isLocked}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0b0' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="text-input"
                                style={{ paddingLeft: 40, marginBottom: 0 }}
                                disabled={isLocked}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        disabled={loading || isLocked}
                    >
                        <LogIn size={18} />
                        {loading ? 'Signing in...' : isLocked ? 'Locked' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#a0a0b0' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};
