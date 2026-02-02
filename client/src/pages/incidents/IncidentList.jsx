import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const IncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        incidentType: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchIncidents();
    }, [filters]);

    const fetchIncidents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.incidentType) params.append('incidentType', filters.incidentType);

            const response = await api.get(`/incidents?${params.toString()}`);
            setIncidents(response.data.data.incidents);
        } catch (error) {
            console.error('Failed to fetch incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            Critical: 'danger',
            High: 'warning',
            Medium: 'primary',
            Low: 'success'
        };
        return colors[priority] || 'primary';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'warning',
            'In Progress': 'primary',
            'Escalated': 'danger',
            'Resolved': 'success',
            'Closed': 'secondary',
            'Rejected': 'danger',
            'Cancelled': 'secondary'
        };
        return colors[status] || 'primary';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
                        <p className="text-gray-600 mt-1">View and manage security incidents</p>
                    </div>
                    <Link to="/incidents/create" className="btn btn-primary">
                        📝 Report Incident
                    </Link>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="input"
                            >
                                <option value="">All Statuses</option>
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Escalated">Escalated</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="input"
                            >
                                <option value="">All Priorities</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={filters.incidentType}
                                onChange={(e) => setFilters({ ...filters, incidentType: e.target.value })}
                                className="input"
                            >
                                <option value="">All Types</option>
                                <option value="Theft">Theft</option>
                                <option value="Assault">Assault</option>
                                <option value="Vandalism">Vandalism</option>
                                <option value="Suspicious Activity">Suspicious Activity</option>
                                <option value="Medical Emergency">Medical Emergency</option>
                                <option value="Fire">Fire</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Incidents List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No incidents found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters or report a new incident</p>
                        <Link to="/incidents/create" className="btn btn-primary">
                            Report Incident
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {incidents.map((incident) => (
                            <Link
                                key={incident.incident_id}
                                to={`/incidents/${incident.incident_id}`}
                                className="card hover:shadow-lg transition-shadow block"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {incident.incident_type}
                                            </h3>
                                            <span className={`badge badge-${getPriorityColor(incident.priority)}`}>
                                                {incident.priority}
                                            </span>
                                            <span className={`badge badge-${getStatusColor(incident.status)}`}>
                                                {incident.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>📍 {incident.map_location || 'Location not specified'}</span>
                                            <span>🕒 {new Date(incident.date_time).toLocaleString()}</span>
                                            <span>👤 {incident.reporter_name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <span className="text-sm text-gray-500">ID: {incident.incident_id}</span>
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

export default IncidentList;
