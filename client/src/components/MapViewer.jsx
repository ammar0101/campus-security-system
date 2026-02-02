import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapViewer = ({ latitude, longitude, title = 'Incident Location' }) => {
    // MMU Cyberjaya coordinates as fallback
    const DEFAULT_CENTER = [2.9267, 101.6574];

    const position = latitude && longitude
        ? [parseFloat(latitude), parseFloat(longitude)]
        : DEFAULT_CENTER;

    return (
        <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
            <MapContainer
                center={position}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {latitude && longitude && (
                    <Marker position={position}>
                        <Popup>{title}</Popup>
                    </Marker>
                )}
            </MapContainer>
            {latitude && longitude && (
                <div className="mt-2 text-sm text-gray-600">
                    <strong>Coordinates:</strong> {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                </div>
            )}
        </div>
    );
};

export default MapViewer;
