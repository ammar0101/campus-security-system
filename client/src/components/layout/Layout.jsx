import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { connected } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['Admin', 'SecurityStaff', 'Student', 'Visitor'] },
        { path: '/incidents', label: 'Incidents', icon: '📋', roles: ['Admin', 'SecurityStaff', 'Student', 'Visitor'] },
        { path: '/my-incidents', label: 'My History', icon: '📜', roles: ['Student'] },
        { path: '/alerts', label: 'Alerts', icon: '🔔', roles: ['Admin', 'SecurityStaff', 'Student', 'Visitor'] },
        { path: '/emergency', label: 'Emergency', icon: '🚨', roles: ['Admin', 'SecurityStaff', 'Student', 'Visitor'], danger: true },
        { path: '/messages', label: 'Messages', icon: '💬', roles: ['Admin', 'SecurityStaff'] },
        { path: '/locations', label: 'Locations', icon: '📍', roles: ['Admin', 'SecurityStaff', 'Student', 'Visitor'] },
        { path: '/analytics', label: 'Analytics', icon: '📊', roles: ['Admin', 'SecurityStaff'] },
        { path: '/users', label: 'Users', icon: '👥', roles: ['Admin'] },
        { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['Admin'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/dashboard" className="flex items-center">
                                <span className="text-2xl font-bold text-primary-600">🛡️ Campus Security</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Connection Status */}
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                                <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
                            </div>

                            {/* User Menu */}
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{user?.userName}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                                <Link to="/profile" className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                    {user?.userName?.charAt(0).toUpperCase()}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-danger-600 transition-colors"
                                    title="Logout"
                                >
                                    🚪
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-2">
                        {filteredNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : item.danger
                                            ? 'bg-danger-50 text-danger-700 hover:bg-danger-100'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
