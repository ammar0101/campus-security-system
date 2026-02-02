import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const SecurityStaffDashboard = () => {
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Security Staff Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome, Officer {user?.userName}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-danger-500 to-danger-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-danger-100 text-sm">Active Incidents</p>
                                <p className="text-3xl font-bold mt-1">{stats?.incidents?.active || 0}</p>
                            </div>
                            <div className="text-5xl opacity-50">🚨</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 text-sm">Total Incidents</p>
                                <p className="text-3xl font-bold mt-1">{stats?.incidents?.total || 0}</p>
                            </div>
                            <div className="text-5xl opacity-50">📋</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-success-500 to-success-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-success-100 text-sm">On-Duty Staff</p>
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
                        <Link to="/alerts/create" className="btn btn-danger text-center py-4">
                            📢 Broadcast Alert
                        </Link>
                        <Link to="/incidents" className="btn btn-primary text-center py-4">
                            📋 View Incidents
                        </Link>
                        <Link to="/messages" className="btn btn-secondary text-center py-4">
                            💬 Messages
                        </Link>
                        <Link to="/locations" className="btn btn-secondary text-center py-4">
                            📍 Locations
                        </Link>
                    </div>
                </div>

                {/* Recent Incidents */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Recent Incidents</h2>
                    <div className="text-center text-gray-500 py-8">
                        <p>No recent incidents</p>
                        <Link to="/incidents" className="text-primary-600 hover:underline mt-2 inline-block">
                            View all incidents →
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SecurityStaffDashboard;
