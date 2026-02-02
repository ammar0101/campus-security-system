// Alert List Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';

const AlertList = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/alerts');
            setAlerts(response.data.data.alerts);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
                    <Link to="/alerts/create" className="btn btn-primary">📢 Create Alert</Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="spinner"></div></div>
                ) : alerts.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold mb-2">No active alerts</h3>
                        <p className="text-gray-600">All clear on campus</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <Link key={alert.alert_id} to={`/alerts/${alert.alert_id}`} className="card hover:shadow-lg transition-shadow block">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`badge badge-${alert.severity === 'Critical' ? 'danger' : 'warning'}`}>
                                                {alert.severity}
                                            </span>
                                            <span className="badge badge-primary">{alert.alert_type}</span>
                                        </div>
                                        <p className="text-gray-900 font-medium mb-2">{alert.message}</p>
                                        <div className="text-sm text-gray-500">
                                            <span>From: {alert.sender_name}</span> • <span>{new Date(alert.time_sent).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AlertList;
