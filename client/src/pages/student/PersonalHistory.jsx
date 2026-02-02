import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../utils/api';

const PersonalHistory = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, in-progress, resolved
    const { showError } = useNotification();

    useEffect(() => {
        fetchMyIncidents();
    }, []);

    const fetchMyIncidents = async () => {
        try {
            const response = await api.get('/incidents/my-incidents');
            setIncidents(response.data.data.incidents);
        } catch (error) {
            console.error('Failed to fetch incidents:', error);
            showError('Failed to load your incident history');
        } finally {
            setLoading(false);
        }
    };

    const filteredIncidents = incidents.filter(incident => {
        if (filter === 'all') return true;
        if (filter === 'new') return incident.status === 'New';
        if (filter === 'in-progress') return ['Acknowledged', 'Assigned', 'In Progress'].includes(incident.status);
        if (filter === 'resolved') return ['Resolved', 'Closed'].includes(incident.status);
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'badge-primary';
            case 'Acknowledged': return 'badge-info';
            case 'Assigned': return 'badge-warning';
            case 'In Progress': return 'badge-warning';
            case 'Resolved': return 'badge-success';
            case 'Closed': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'text-danger-600 bg-danger-50';
            case 'High': return 'text-warning-600 bg-warning-50';
            case 'Medium': return 'text-primary-600 bg-primary-50';
            case 'Low': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Incident History</h1>
                        <p className="text-gray-600 mt-1">View all your submitted incident reports</p>
                    </div>
                    <Link to="/incidents/create" className="btn btn-primary">
                        ➕ Report New Incident
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-primary-50 border-primary-200">
                        <p className="text-sm text-primary-600">Total Reports</p>
                        <p className="text-2xl font-bold text-primary-900">{incidents.length}</p>
                    </div>
                    <div className="card bg-warning-50 border-warning-200">
                        <p className="text-sm text-warning-600">In Progress</p>
                        <p className="text-2xl font-bold text-warning-900">
                            {incidents.filter(i => ['Acknowledged', 'Assigned', 'In Progress'].includes(i.status)).length}
                        </p>
                    </div>
                    <div className="card bg-success-50 border-success-200">
                        <p className="text-sm text-success-600">Resolved</p>
                        <p className="text-2xl font-bold text-success-900">
                            {incidents.filter(i => ['Resolved', 'Closed'].includes(i.status)).length}
                        </p>
                    </div>
                    <div className="card bg-gray-50 border-gray-200">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {incidents.filter(i => i.status === 'New').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All ({incidents.length})
                        </button>
                        <button
                            onClick={() => setFilter('new')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'new' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            New ({incidents.filter(i => i.status === 'New').length})
                        </button>
                        <button
                            onClick={() => setFilter('in-progress')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'in-progress' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            In Progress ({incidents.filter(i => ['Acknowledged', 'Assigned', 'In Progress'].includes(i.status)).length})
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'resolved' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Resolved ({incidents.filter(i => ['Resolved', 'Closed'].includes(i.status)).length})
                        </button>
                    </div>
                </div>

                {/* Incidents List */}
                {filteredIncidents.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Incidents Found</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? "You haven't reported any incidents yet."
                                : `No ${filter} incidents found.`
                            }
                        </p>
                        {filter === 'all' && (
                            <Link to="/incidents/create" className="btn btn-primary">
                                Report Your First Incident
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredIncidents.map((incident) => (
                            <Link
                                key={incident.incidentID}
                                to={`/incidents/${incident.incidentID}`}
                                className="card hover:shadow-lg transition-shadow block"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {incident.incidentType}
                                            </h3>
                                            <span className={`badge ${getStatusColor(incident.status)}`}>
                                                {incident.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                                                {incident.priority}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3 line-clamp-2">
                                            {incident.description}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>
                                                📅 {new Date(incident.dateTime).toLocaleDateString()}
                                            </span>
                                            <span>
                                                🕒 {new Date(incident.dateTime).toLocaleTimeString()}
                                            </span>
                                            {incident.location && (
                                                <span>
                                                    📍 {incident.location.building}
                                                    {incident.location.floor && ` - ${incident.location.floor}`}
                                                    {incident.location.room && ` - ${incident.location.room}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-2xl">
                                        →
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

export default PersonalHistory;
