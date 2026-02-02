import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

const MapPicker = ({ onLocationSelect, initialPosition = null }) => {
    // MMU Cyberjaya coordinates
    const DEFAULT_CENTER = [2.9267, 101.6574];

    // Initialize position from initialPosition if provided
    const [position, setPosition] = useState(() => {
        if (initialPosition && initialPosition.length === 2) {
            return { lat: initialPosition[0], lng: initialPosition[1] };
        }
        return null;
    });

    // Update position when initialPosition changes (GPS capture)
    React.useEffect(() => {
        if (initialPosition && initialPosition.length === 2) {
            setPosition({ lat: initialPosition[0], lng: initialPosition[1] });
        }
    }, [initialPosition]);

    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
        if (onLocationSelect) {
            onLocationSelect({
                latitude: newPosition.lat,
                longitude: newPosition.lng
            });
        }
    };

    return (
        <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
            <MapContainer
                center={initialPosition || DEFAULT_CENTER}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
            {position && (
                <div className="mt-2 text-sm text-gray-600">
                    <strong>Selected Location:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
};

export default MapPicker;
