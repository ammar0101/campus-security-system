import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../utils/api';

const CreateAlert = () => {
    const [formData, setFormData] = useState({
        alertType: 'Emergency',
        severity: 'High',
        message: '',
        targetAudience: 'All',
        expiresAt: ''
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate expiration date (24 hours from now if not specified)
            const expiresAt = formData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            // Format targetAudience based on selection
            let targetAudienceObj = { roles: [], specificUsers: [] };

            if (formData.targetAudience === 'All') {
                targetAudienceObj.roles = ['Admin', 'SecurityStaff', 'Student', 'Visitor'];
            } else if (formData.targetAudience === 'Students') {
                targetAudienceObj.roles = ['Student'];
            } else if (formData.targetAudience === 'Staff') {
                targetAudienceObj.roles = ['Admin', 'SecurityStaff'];
            } else if (formData.targetAudience === 'Security') {
                targetAudienceObj.roles = ['SecurityStaff'];
            } else if (formData.targetAudience === 'Visitors') {
                targetAudienceObj.roles = ['Visitor'];
            }

            const response = await api.post('/alerts', {
                alertType: formData.alertType,
                severity: formData.severity,
                message: formData.message,
                targetAudience: targetAudienceObj,
                expiresAt: expiresAt
            });

            showSuccess('Alert broadcasted successfully!');
            navigate('/alerts');
        } catch (error) {
            showError(error.response?.data?.error?.message || 'Failed to broadcast alert');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Broadcast Alert</h1>
                    <p className="text-gray-600 mt-1">Send an alert to campus community</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alert Type *
                                </label>
                                <select
                                    name="alertType"
                                    required
                                    value={formData.alertType}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="Emergency">Emergency</option>
                                    <option value="Security">Security</option>
                                    <option value="Weather">Weather</option>
                                    <option value="Event">Event</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Severity *
                                </label>
                                <select
                                    name="severity"
                                    required
                                    value={formData.severity}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alert Message *
                            </label>
                            <textarea
                                name="message"
                                required
                                value={formData.message}
                                onChange={handleChange}
                                rows="6"
                                className="input"
                                placeholder="Enter the alert message that will be broadcasted to all users..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Audience *
                            </label>
                            <select
                                name="targetAudience"
                                required
                                value={formData.targetAudience}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="All">All Users</option>
                                <option value="Students">Students Only</option>
                                <option value="Staff">Staff Only</option>
                                <option value="Security">Security Staff Only</option>
                                <option value="Visitors">Visitors Only</option>
                            </select>
                        </div>

                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                            <h3 className="font-semibold text-warning-900 mb-2">⚠️ Alert Broadcasting Notice</h3>
                            <ul className="text-sm text-warning-800 space-y-1">
                                <li>• This alert will be sent to all selected users immediately</li>
                                <li>• Users will receive real-time notifications</li>
                                <li>• Critical alerts will trigger push notifications</li>
                                <li>• All alerts are logged for audit purposes</li>
                            </ul>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex-1 py-3 text-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Broadcasting...' : '📢 Broadcast Alert'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/alerts')}
                                className="btn btn-secondary px-8"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CreateAlert;
