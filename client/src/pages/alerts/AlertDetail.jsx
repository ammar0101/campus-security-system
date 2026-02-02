import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const AlertDetail = () => {
    const { id } = useParams();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlert();
    }, [id]);

    const fetchAlert = async () => {
        try {
            const response = await api.get(`/alerts/${id}`);
            setAlert(response.data.data);
        } catch (error) {
            showError('Failed to load alert details');
            navigate('/alerts');
        } finally {
            setLoading(false);
        }
    };

    const acknowledgeAlert = async () => {
        try {
            console.log('Acknowledging alert:', id);
            await api.post(`/alerts/${id}/acknowledge`);
            showSuccess('Alert acknowledged');
            fetchAlert();
        } catch (error) {
            console.error('Acknowledge error:', error.response?.data);
            const errorMsg = error.response?.data?.error?.message || 'Failed to acknowledge alert';
            showError(errorMsg);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center py-12">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    if (!alert) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p>Alert not found</p>
                </div>
            </Layout>
        );
    }

    const getSeverityColor = (severity) => {
        const colors = {
            Critical: 'danger',
            High: 'warning',
            Medium: 'primary',
            Low: 'success'
        };
        return colors[severity] || 'primary';
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{alert.alert_type} Alert</h1>
                        <p className="text-gray-600 mt-1">ID: {alert.alert_id}</p>
                    </div>
                    <span className={`badge badge-${getSeverityColor(alert.severity)} text-lg px-4 py-2`}>
                        {alert.severity}
                    </span>
                </div>

                {/* Alert Message */}
                <div className={`card border-2 border-${getSeverityColor(alert.severity)}-500 bg-${getSeverityColor(alert.severity)}-50`}>
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">
                            {alert.severity === 'Critical' ? '🚨' : alert.severity === 'High' ? '⚠️' : '📢'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{alert.message}</h2>
                        <div className="text-sm text-gray-600">
                            <p>Broadcasted by: {alert.sender_name}</p>
                            <p>Time: {new Date(alert.time_sent).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Alert Details */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Alert Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Alert Type</label>
                            <p className="text-gray-900 mt-1">{alert.alert_type}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Severity</label>
                            <p className="text-gray-900 mt-1">{alert.severity}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className="text-gray-900 mt-1">{alert.status || 'Broadcasting'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Sent At</label>
                            <p className="text-gray-900 mt-1">{new Date(alert.time_sent).toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Your Status</label>
                            {alert.acknowledged_at ? (
                                <p className="text-green-600 mt-1 font-semibold">
                                    ✓ Acknowledged on {new Date(alert.acknowledged_at).toLocaleString()}
                                </p>
                            ) : (
                                <p className="text-gray-500 mt-1">Not acknowledged yet</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Acknowledgements</label>
                            <p className="text-gray-900 mt-1">{alert.acknowledgment_count || 0} recipients acknowledged</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                    <button onClick={() => navigate('/alerts')} className="btn btn-secondary">
                        ← Back to Alerts
                    </button>
                    {alert.acknowledged_at ? (
                        <button disabled className="btn btn-success opacity-50 cursor-not-allowed">
                            ✓ Already Acknowledged
                        </button>
                    ) : (
                        <button onClick={acknowledgeAlert} className="btn btn-primary">
                            ✓ Acknowledge Alert
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AlertDetail;
