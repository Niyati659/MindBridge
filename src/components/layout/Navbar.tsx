import { Link, useLocation } from 'react-router-dom';
import { Home, Smile, BookOpen, Users, Settings, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const navItems = isAuthenticated ? [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/mood', label: 'Mood', icon: Smile },
        { path: '/journal', label: 'Journal', icon: BookOpen },
        { path: '/circles', label: 'Circles', icon: Users },
        { path: '/friends', label: 'Friends', icon: UserPlus },
        { path: '/my-circles', label: 'My Circles', icon: Settings },
    ] : [
        { path: '/', label: 'Home', icon: Home },
    ];

    return (
        <nav className="navbar">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <Icon size={18} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}

            {/* Auth button */}
            {isAuthenticated ? (
                <Link
                    to="/profile"
                    className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                    <User size={18} />
                    <span>Profile</span>
                </Link>
            ) : (
                <Link
                    to="/login"
                    className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                    <LogIn size={18} />
                    <span>Login</span>
                </Link>
            )}
        </nav>
    );
};
