import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import MapPicker from '../../components/MapPicker';
import api from '../../utils/api';

const CreateIncident = () => {
    const [formData, setFormData] = useState({
        incidentType: 'Suspicious Activity',
        priority: 'Medium',
        description: '',
        locationID: '',
        latitude: '',
        longitude: ''
    });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(true);
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocations();
        captureGPSLocation();
    }, []);

    const captureGPSLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    }));
                    setGpsLoading(false);
                    showSuccess('📍 Location captured automatically');
                },
                (error) => {
                    console.error('GPS error:', error);
                    // Fallback to MMU campus location
                    setFormData(prev => ({
                        ...prev,
                        latitude: '2.9267',
                        longitude: '101.6574'
                    }));
                    setGpsLoading(false);
                    showError('Using default campus location');
                }
            );
        } else {
            // Fallback to MMU campus location
            setFormData(prev => ({
                ...prev,
                latitude: '2.9267',
                longitude: '101.6574'
            }));
            setGpsLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            console.log('Fetching locations...');
            const response = await api.get('/locations');
            console.log('Locations response:', response.data);

            const locationsList = response.data.data.locations || [];
            console.log('Locations list:', locationsList);

            setLocations(locationsList);

            // Set first location as default if available
            if (locationsList.length > 0) {
                setFormData(prev => ({ ...prev, locationID: locationsList[0].location_id }));
                showSuccess(`Loaded ${locationsList.length} locations`);
            } else {
                showError('No locations found in database');
            }
        } catch (error) {
            console.error('Failed to fetch locations:', error);
            showError(`Failed to load locations: ${error.response?.data?.error?.message || error.message}`);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString()
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!formData.description || formData.description.trim() === '') {
            showError('Please enter a description');
            return;
        }

        if (!formData.locationID) {
            showError('Please select a location');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                incidentType: formData.incidentType,
                priority: formData.priority,
                description: formData.description,
                locationID: formData.locationID,
                latitude: formData.latitude || null,
                longitude: formData.longitude || null
            };

            console.log('Submitting incident:', payload);
            const response = await api.post('/incidents', payload);
            console.log('Incident created:', response.data);

            showSuccess('Incident reported successfully');
            navigate(`/incidents/${response.data.data.incidentID}`);
        } catch (error) {
            console.error('Submit error:', error.response?.data || error);

            // Log validation errors if present
            if (error.response?.data?.error?.errors) {
                console.error('Validation errors:', error.response.data.error.errors);
            }

            const errorMsg = error.response?.data?.error?.message || 'Failed to report incident';

            // Show specific validation errors if available
            if (error.response?.data?.error?.errors?.length > 0) {
                const validationErrors = error.response.data.error.errors
                    .map(err => `${err.field}: ${err.message}`)
                    .join(', ');
                showError(`Validation Error: ${validationErrors}`);
            } else {
                showError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Report Incident</h1>
                    <p className="text-gray-600 mt-1">Provide details about the security incident</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Incident Type *
                                </label>
                                <select
                                    name="incidentType"
                                    required
                                    value={formData.incidentType}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="Theft">Theft</option>
                                    <option value="Assault">Assault</option>
                                    <option value="Vandalism">Vandalism</option>
                                    <option value="Suspicious Activity">Suspicious Activity</option>
                                    <option value="Medical Emergency">Medical Emergency</option>
                                    <option value="Fire">Fire</option>
                                    <option value="Harassment">Harassment</option>
                                    <option value="Trespassing">Trespassing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority *
                                </label>
                                <select
                                    name="priority"
                                    required
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                className="input"
                                placeholder="Provide detailed information about the incident..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Description *
                            </label>
                            <input
                                type="text"
                                name="locationID"
                                required
                                value={formData.locationID}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., FCI - Ground Floor, Library Level 2, Cafeteria..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter the location description (building, floor, area)
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">📍 Exact Location on Map</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Click on the map to pinpoint the exact location of the incident
                            </p>
                            <MapPicker
                                onLocationSelect={handleLocationSelect}
                                initialPosition={formData.latitude && formData.longitude ?
                                    [parseFloat(formData.latitude), parseFloat(formData.longitude)] : null
                                }
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex-1 py-3 text-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/incidents')}
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

export default CreateIncident;
