const { Location } = require('../models');
const { Op } = require('sequelize');

/**
 * Find the nearest location to given coordinates
 * Uses Haversine formula for distance calculation
 */
const findNearestLocation = async (latitude, longitude, maxDistanceMeters = 200) => {
    try {
        // Get all locations
        const locations = await Location.findAll();

        if (locations.length === 0) {
            return null;
        }

        // Calculate distance for each location using Haversine formula
        const locationsWithDistance = locations.map(location => {
            const distance = calculateDistance(
                latitude,
                longitude,
                parseFloat(location.latitude),
                parseFloat(location.longitude)
            );

            return {
                ...location.toJSON(),
                distance
            };
        });

        // Sort by distance
        locationsWithDistance.sort((a, b) => a.distance - b.distance);

        // Return nearest location if within max distance
        const nearest = locationsWithDistance[0];

        if (nearest.distance <= maxDistanceMeters) {
            return nearest;
        }

        return null;
    } catch (error) {
        console.error('Error finding nearest location:', error);
        return null;
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Find locations within a radius
 */
const findLocationsNearby = async (latitude, longitude, radiusMeters = 500, limit = 10) => {
    try {
        const locations = await Location.findAll();

        const locationsWithDistance = locations.map(location => {
            const distance = calculateDistance(
                latitude,
                longitude,
                parseFloat(location.latitude),
                parseFloat(location.longitude)
            );

            return {
                ...location.toJSON(),
                distance
            };
        });

        // Filter by radius and sort by distance
        const nearby = locationsWithDistance
            .filter(loc => loc.distance <= radiusMeters)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);

        return nearby;
    } catch (error) {
        console.error('Error finding nearby locations:', error);
        return [];
    }
};

module.exports = {
    findNearestLocation,
    calculateDistance,
    findLocationsNearby
};
