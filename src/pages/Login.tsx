import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const result = login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login failed');
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
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 8,
                            marginBottom: 16,
                            color: '#f87171',
                            fontSize: 14
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#a0a0b0' }}>
                            Email or Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email or username"
                                className="text-input"
                                style={{ paddingLeft: 40, marginBottom: 0 }}
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
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        disabled={loading}
                    >
                        <LogIn size={18} />
                        {loading ? 'Signing in...' : 'Sign In'}
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
