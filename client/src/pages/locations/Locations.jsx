import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await api.get('/locations');
            setLocations(response.data.data.locations);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campus Locations</h1>
                    <p className="text-gray-600 mt-1">View and manage campus security locations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Location List */}
                    <div className="lg:col-span-1 card">
                        <h2 className="text-xl font-bold mb-4">Locations</h2>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {locations.map((loc) => (
                                    <button
                                        key={loc.location_id}
                                        onClick={() => setSelectedLocation(loc)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedLocation?.location_id === loc.location_id
                                            ? 'bg-primary-100 border-2 border-primary-500'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{loc.building}</p>
                                                <p className="text-xs text-gray-500">{loc.zone} • {loc.location_type}</p>
                                            </div>
                                            <span className="text-2xl">📍</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Map & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map Placeholder */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Campus Map</h2>
                            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🗺️</div>
                                    <p className="text-gray-600 mb-2">Interactive Map</p>
                                    <p className="text-sm text-gray-500">
                                        Leaflet map integration would be displayed here
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Install: npm install react-leaflet leaflet
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        {selectedLocation && (
                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">Location Details</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Building</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.building}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Zone</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.zone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Floor</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.floor || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Type</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.location_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Capacity</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.capacity || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Accessible</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.is_accessible ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Latitude</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.latitude?.toFixed(6)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Longitude</label>
                                        <p className="text-gray-900 mt-1">{selectedLocation.longitude?.toFixed(6)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedLocation.description || 'No description available'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-primary-50">
                        <h3 className="text-sm text-primary-700 mb-1">Total Locations</h3>
                        <p className="text-2xl font-bold text-primary-900">{locations.length}</p>
                    </div>
                    <div className="card bg-success-50">
                        <h3 className="text-sm text-success-700 mb-1">Security Posts</h3>
                        <p className="text-2xl font-bold text-success-900">
                            {locations.filter((l) => l.location_name.includes('Security')).length}
                        </p>
                    </div>
                    <div className="card bg-warning-50">
                        <h3 className="text-sm text-warning-700 mb-1">Academic Buildings</h3>
                        <p className="text-2xl font-bold text-warning-900">
                            {locations.filter((l) => l.location_type === 'Academic' || l.location_type === 'Library').length}
                        </p>
                    </div>
                    <div className="card bg-danger-50">
                        <h3 className="text-sm text-danger-700 mb-1">Parking Areas</h3>
                        <p className="text-2xl font-bold text-danger-900">
                            {locations.filter((l) => l.location_type === 'Parking').length}
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Locations;
