import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../utils/api';

const EmergencyPanic = () => {
    const [countdown, setCountdown] = useState(5);
    const [isActivating, setIsActivating] = useState(false);
    const [activated, setActivated] = useState(false);
    const [location, setLocation] = useState(null);
    const locationRef = useRef(null); // Use ref to store location immediately
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    const startEmergency = () => {
        setIsActivating(true);
        let count = 5;

        // Set default campus location immediately in both state and ref
        const defaultLocation = {
            latitude: 2.9267,
            longitude: 101.6574,
            accuracy: null
        };
        setLocation(defaultLocation);
        locationRef.current = defaultLocation; // Store in ref immediately

        // Try to get precise user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const gpsLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setLocation(gpsLocation);
                    locationRef.current = gpsLocation; // Update ref with GPS location
                    console.log('GPS location captured:', position.coords);
                },
                (error) => {
                    console.warn('Geolocation failed, using default campus location:', error);
                    // Keep default location already set
                }
            );
        } else {
            console.warn('Geolocation not supported, using default campus location');
        }

        const timer = setInterval(() => {
            count--;
            setCountdown(count);

            if (count === 0) {
                clearInterval(timer);
                // Wait a small moment to allow GPS to update if available
                setTimeout(() => activateEmergency(), 100);
            }
        }, 1000);
    };

    const activateEmergency = async () => {
        try {
            // Use ref which is always available
            const currentLocation = locationRef.current;
            console.log('Activating emergency with location:', currentLocation);

            const response = await api.post('/incidents/emergency-panic', {
                currentLocation: {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude
                },
                accuracyMeters: currentLocation.accuracy || null
            });

            setActivated(true);
            showSuccess('Emergency alert sent! Help is on the way.');

            // Redirect to incident detail after 3 seconds
            setTimeout(() => {
                navigate(`/incidents/${response.data.data.incidentID}`);
            }, 3000);
        } catch (error) {
            console.error('Emergency activation error:', error.response?.data || error);
            const errorMsg = error.response?.data?.error?.message || error.message || 'Failed to send emergency alert. Please call security directly.';
            showError(errorMsg);
            setIsActivating(false);
            setCountdown(5);
        }
    };

    const cancelEmergency = () => {
        setIsActivating(false);
        setCountdown(5);
    };

    if (activated) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto">
                    <div className="card bg-success-50 border-2 border-success-500 text-center py-12">
                        <div className="text-8xl mb-6 animate-bounce">✅</div>
                        <h1 className="text-3xl font-bold text-success-900 mb-4">Emergency Alert Sent!</h1>
                        <p className="text-success-700 text-lg mb-6">
                            Security personnel have been notified and are on their way to your location.
                        </p>
                        <div className="space-y-3 text-success-800">
                            <p>📍 Your location has been shared</p>
                            <p>🚨 Priority: CRITICAL</p>
                            <p>⏱️ Estimated response time: 2-5 minutes</p>
                        </div>
                        <div className="mt-8">
                            <p className="text-sm text-success-600">Stay calm and stay where you are if safe to do so.</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (isActivating) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto">
                    <div className="card bg-danger-50 border-2 border-danger-500 text-center py-12">
                        <div className="text-9xl mb-6 pulse-danger">🚨</div>
                        <h1 className="text-4xl font-bold text-danger-900 mb-4">
                            Activating Emergency Alert
                        </h1>
                        <div className="text-8xl font-bold text-danger-600 my-8">
                            {countdown}
                        </div>
                        <p className="text-danger-700 text-lg mb-8">
                            Emergency services will be notified in {countdown} seconds
                        </p>
                        <button
                            onClick={cancelEmergency}
                            className="btn btn-secondary px-8 py-3 text-lg font-semibold"
                        >
                            Cancel Emergency
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="card">
                    <div className="text-center py-8">
                        <div className="text-8xl mb-6">🚨</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Emergency Panic Button</h1>
                        <p className="text-gray-600 mb-8">
                            Use this button only in case of a real emergency. Security personnel will be immediately notified.
                        </p>

                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 mb-8">
                            <h3 className="font-bold text-warning-900 mb-3">⚠️ When to use this button:</h3>
                            <ul className="text-left text-warning-800 space-y-2">
                                <li>• You are in immediate danger</li>
                                <li>• You witness a crime in progress</li>
                                <li>• You need urgent medical assistance</li>
                                <li>• Any life-threatening situation</li>
                            </ul>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h3 className="font-bold text-gray-900 mb-3">What happens when you press this button:</h3>
                            <ul className="text-left text-gray-700 space-y-2">
                                <li>✓ Your exact location will be shared with security</li>
                                <li>✓ All nearby security staff will be alerted</li>
                                <li>✓ A critical incident will be created</li>
                                <li>✓ Emergency response will be dispatched</li>
                            </ul>
                        </div>

                        <button
                            onClick={startEmergency}
                            className="btn btn-danger px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            🚨 ACTIVATE EMERGENCY
                        </button>

                        <p className="text-sm text-gray-500 mt-6">
                            For non-emergencies, please <a href="/incidents/create" className="text-primary-600 hover:underline">report an incident</a> instead.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmergencyPanic;
