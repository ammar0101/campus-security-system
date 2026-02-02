import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.userName}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 text-sm">Total Incidents</p>
                                <p className="text-3xl font-bold mt-1">{stats?.incidents?.total || 0}</p>
                            </div>
                            <div className="text-5xl opacity-50">📋</div>
                        </div>
                        <div className="mt-4 text-sm">
                            <span className="text-primary-100">Critical: {stats?.incidents?.critical || 0}</span>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-danger-500 to-danger-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-danger-100 text-sm">Active Alerts</p>
                                <p className="text-3xl font-bold mt-1">{stats?.alerts?.active || 0}</p>
                            </div>
                            <div className="text-5xl opacity-50">🔔</div>
                        </div>
                        <div className="mt-4 text-sm">
                            <span className="text-danger-100">Total: {stats?.alerts?.total || 0}</span>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-success-500 to-success-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-success-100 text-sm">Active Users</p>
                                <p className="text-3xl font-bold mt-1">{stats?.users?.active || 0}</p>
                            </div>
                            <div className="text-5xl opacity-50">👥</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-warning-500 to-warning-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-warning-100 text-sm">On-Duty Staff</p>
                                <p className="text-3xl font-bold mt-1">{stats?.users?.onDutyStaff || 0}</p>
                            </div>
                            <div className="text-5xl opacity-50">🛡️</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/alerts/create" className="btn btn-primary text-center py-4">
                            📢 Broadcast Alert
                        </Link>
                        <Link to="/incidents" className="btn btn-secondary text-center py-4">
                            📋 View Incidents
                        </Link>
                        <Link to="/users" className="btn btn-secondary text-center py-4">
                            👥 Manage Users
                        </Link>
                        <Link to="/analytics" className="btn btn-secondary text-center py-4">
                            📊 View Analytics
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Incident Overview</h2>
                        <div className="space-y-3">
                            {stats?.incidents?.byStatus?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{item.status}</span>
                                    <span className="badge badge-primary">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">System Health</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Avg Response Time</span>
                                    <span className="font-semibold">{stats?.incidents?.avgResponseTime || 0} min</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>System Uptime</span>
                                    <span className="font-semibold">99.9%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
