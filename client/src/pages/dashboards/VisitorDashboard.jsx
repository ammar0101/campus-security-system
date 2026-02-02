import React from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const VisitorDashboard = () => {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Visitor Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome, {user?.userName}</p>
                </div>

                {/* Emergency Button */}
                <div className="card bg-gradient-to-br from-danger-500 to-danger-600 text-white">
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🚨</div>
                        <h2 className="text-2xl font-bold mb-2">Emergency Assistance</h2>
                        <p className="text-danger-100 mb-6">Press if you need immediate help</p>
                        <Link to="/emergency" className="btn bg-white text-danger-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                            Activate Emergency Panic
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/incidents/create" className="card hover:shadow-lg transition-shadow">
                        <div className="text-center py-6">
                            <div className="text-5xl mb-3">📝</div>
                            <h3 className="font-bold text-lg">Report Incident</h3>
                            <p className="text-gray-600 text-sm mt-2">Report a security concern</p>
                        </div>
                    </Link>

                    <Link to="/alerts" className="card hover:shadow-lg transition-shadow">
                        <div className="text-center py-6">
                            <div className="text-5xl mb-3">🔔</div>
                            <h3 className="font-bold text-lg">Active Alerts</h3>
                            <p className="text-gray-600 text-sm mt-2">View campus alerts</p>
                        </div>
                    </Link>
                </div>

                {/* Visitor Info */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Visitor Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <h4 className="font-semibold">Campus Guidelines</h4>
                                <p className="text-sm text-gray-600">Please follow all campus rules and regulations during your visit</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-warning-50 rounded-lg">
                            <span className="text-2xl">🎫</span>
                            <div>
                                <h4 className="font-semibold">Visitor Pass</h4>
                                <p className="text-sm text-gray-600">Keep your visitor pass visible at all times</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg">
                            <span className="text-2xl">📞</span>
                            <div>
                                <h4 className="font-semibold">Emergency Contact</h4>
                                <p className="text-sm text-gray-600">Security Hotline: +1-234-567-8900</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VisitorDashboard;
