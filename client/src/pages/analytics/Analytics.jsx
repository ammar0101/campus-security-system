import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/analytics/dashboard?range=${timeRange}`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportData = async () => {
        try {
            const response = await api.get('/analytics/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                        <p className="text-gray-600 mt-1">View system statistics and trends</p>
                    </div>
                    <div className="flex space-x-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="input w-40"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                        <button onClick={exportData} className="btn btn-secondary">
                            📥 Export Data
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                                <h3 className="text-primary-100 text-sm">Total Incidents</h3>
                                <p className="text-3xl font-bold mt-2">{stats?.incidents?.total || 0}</p>
                                <p className="text-sm text-primary-100 mt-2">
                                    {stats?.incidents?.change > 0 ? '↑' : '↓'} {Math.abs(stats?.incidents?.change || 0)}% from last period
                                </p>
                            </div>

                            <div className="card bg-gradient-to-br from-danger-500 to-danger-600 text-white">
                                <h3 className="text-danger-100 text-sm">Critical Incidents</h3>
                                <p className="text-3xl font-bold mt-2">{stats?.incidents?.critical || 0}</p>
                                <p className="text-sm text-danger-100 mt-2">Requires immediate attention</p>
                            </div>

                            <div className="card bg-gradient-to-br from-success-500 to-success-600 text-white">
                                <h3 className="text-success-100 text-sm">Resolved</h3>
                                <p className="text-3xl font-bold mt-2">{stats?.incidents?.resolved || 0}</p>
                                <p className="text-sm text-success-100 mt-2">
                                    {stats?.incidents?.resolutionRate || 0}% resolution rate
                                </p>
                            </div>

                            <div className="card bg-gradient-to-br from-warning-500 to-warning-600 text-white">
                                <h3 className="text-warning-100 text-sm">Avg Response Time</h3>
                                <p className="text-3xl font-bold mt-2">{stats?.incidents?.avgResponseTime || 0} min</p>
                                <p className="text-sm text-warning-100 mt-2">Target: &lt; 10 minutes</p>
                            </div>
                        </div>

                        {/* Incident Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">Incidents by Type</h2>
                                <div className="space-y-3">
                                    {stats?.incidents?.byType?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full bg-primary-500`}></div>
                                                <span className="font-medium">{item.incident_type}</span>
                                            </div>
                                            <span className="badge badge-primary">{item.count}</span>
                                        </div>
                                    )) || (
                                            <p className="text-gray-500 text-center py-4">No data available</p>
                                        )}
                                </div>
                            </div>

                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">Incidents by Status</h2>
                                <div className="space-y-3">
                                    {stats?.incidents?.byStatus?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium">{item.status}</span>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full"
                                                        style={{ width: `${(item.count / stats?.incidents?.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="badge badge-primary w-12 text-center">{item.count}</span>
                                            </div>
                                        </div>
                                    )) || []}
                                </div>
                            </div>
                        </div>

                        {/* Alerts & Users */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">Alert Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Total Alerts Sent</span>
                                        <span className="font-bold text-lg">{stats?.alerts?.total || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Active Alerts</span>
                                        <span className="font-bold text-lg">{stats?.alerts?.active || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Acknowledgment Rate</span>
                                        <span className="font-bold text-lg">{stats?.alerts?.ackRate || 0}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">User Statistics</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Total Users</span>
                                        <span className="font-bold text-lg">{stats?.users?.total || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>Active Users</span>
                                        <span className="font-bold text-lg">{stats?.users?.active || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span>On-Duty Staff</span>
                                        <span className="font-bold text-lg">{stats?.users?.onDutyStaff || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Analytics;
