import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import MapViewer from '../../components/MapViewer';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const IncidentDetail = () => {
    const { id } = useParams();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncident();
    }, [id]);

    const fetchIncident = async () => {
        try {
            const response = await api.get(`/incidents/${id}`);
            setIncident(response.data.data);
        } catch (error) {
            showError('Failed to load incident details');
            navigate('/incidents');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            const payload = { status: newStatus };

            // Prompt for resolution notes if marking as Resolved
            if (newStatus === 'Resolved') {
                const notes = prompt('Enter resolution notes (minimum 10 characters):');
                if (!notes || notes.length < 10) {
                    showError('Resolution notes must be at least 10 characters');
                    return;
                }
                payload.resolutionNotes = notes;
            }

            // Prompt for escalation reason if escalating
            if (newStatus === 'Escalated') {
                const reason = prompt('Enter escalation reason (minimum 10 characters):');
                if (!reason || reason.length < 10) {
                    showError('Escalation reason must be at least 10 characters');
                    return;
                }
                payload.escalationReason = reason;
            }

            await api.patch(`/incidents/${id}/status`, payload);
            showSuccess('Status updated successfully');
            fetchIncident();
        } catch (error) {
            console.error('Status update error:', error.response?.data);
            showError(error.response?.data?.error?.message || 'Failed to update status');
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

    if (!incident) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p>Incident not found</p>
                </div>
            </Layout>
        );
    }

    const canUpdateStatus = user?.role === 'Admin' || user?.role === 'SecurityStaff';

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{incident.incident_type}</h1>
                        <p className="text-gray-600 mt-1">ID: {incident.incident_id}</p>
                    </div>
                    <div className="flex space-x-2">
                        <span className={`badge badge-${incident.priority === 'Critical' ? 'danger' : 'warning'} text-lg px-4 py-2`}>
                            {incident.priority}
                        </span>
                        <span className={`badge badge-primary text-lg px-4 py-2`}>
                            {incident.status}
                        </span>
                    </div>
                </div>

                {/* Details Card */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Incident Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-gray-900 mt-1">{incident.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Reported By</label>
                                <p className="text-gray-900 mt-1">{incident.reporter_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                <p className="text-gray-900 mt-1">{new Date(incident.date_time).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Location</label>
                                <p className="text-gray-900 mt-1">{incident.map_location || 'Not specified'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Response Time</label>
                                <p className="text-gray-900 mt-1">{incident.response_time ? `${incident.response_time} min` : 'Pending'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Location */}
                {incident.latitude && incident.longitude && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">📍 Incident Location</h2>
                        <MapViewer
                            latitude={incident.latitude}
                            longitude={incident.longitude}
                            title={`Incident #${incident.incident_id}`}
                        />
                    </div>
                )}

                {/* Status Update (Security Staff/Admin only) */}
                {canUpdateStatus && incident.status === 'New' && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Update Status</h2>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => updateStatus('In Progress')} className="btn btn-primary">
                                Start Investigation
                            </button>
                            <button onClick={() => updateStatus('Rejected')} className="btn btn-danger">
                                Reject
                            </button>
                            <button onClick={() => updateStatus('Cancelled')} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {canUpdateStatus && incident.status === 'In Progress' && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Update Status</h2>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => updateStatus('Escalated')} className="btn btn-warning">
                                Escalate
                            </button>
                            <button onClick={() => updateStatus('Resolved')} className="btn btn-success">
                                Mark as Resolved
                            </button>
                        </div>
                    </div>
                )}

                {canUpdateStatus && incident.status === 'Escalated' && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Update Status</h2>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => updateStatus('Resolved')} className="btn btn-success">
                                Mark as Resolved
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4">
                    <button onClick={() => navigate('/incidents')} className="btn btn-secondary">
                        ← Back to Incidents
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default IncidentDetail;
