import { Users, Search } from 'lucide-react';

export const CirclesPage = () => {
    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <h1 className="page-title">Circles</h1>
            <p className="page-subtitle">Join communities that support your journey</p>

            <div className="card" style={{ textAlign: 'center', padding: 48, color: '#666' }}>
                <Users size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <p style={{ fontSize: 18, marginBottom: 8 }}>Coming Soon</p>
                <p style={{ fontSize: 14 }}>Support circles are being built. Check back soon!</p>
            </div>
        </div>
    );
};
