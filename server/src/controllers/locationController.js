const { Location } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { generateLocationId } = require('../utils/generateIds');
const { findLocationsNearby } = require('../utils/findNearestLocation');
const { Op } = require('sequelize');

const createLocation = async (req, res, next) => {
    try {
        const locationId = generateLocationId();
        const location = await Location.create({
            location_id: locationId,
            ...req.body
        });

        return successResponse(res, 201, 'Location added successfully', location.toJSON());
    } catch (error) {
        next(error);
    }
};

const listLocations = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, zone, building, locationType, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};

        if (zone) where.zone = zone;
        if (building) where.building = { [Op.iLike]: `%${building}%` };
        if (locationType) where.location_type = locationType;
        if (search) {
            where[Op.or] = [
                { building: { [Op.iLike]: `%${search}%` } },
                { map_location: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Location.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['building', 'ASC']]
        });

        return successResponse(res, 200, 'Locations retrieved successfully', {
            locations: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)),
                totalCount: count
            }
        });
    } catch (error) {
        next(error);
    }
};

const getLocation = async (req, res, next) => {
    try {
        const location = await Location.findOne({ where: { location_id: req.params.locationID } });

        if (!location) {
            return errorResponse(res, 404, 'LOCATION_NOT_FOUND', 'Location not found');
        }

        return successResponse(res, 200, 'Location retrieved successfully', location.toJSON());
    } catch (error) {
        next(error);
    }
};

const getNearbyLocations = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 500, limit = 10 } = req.query;

        if (!latitude || !longitude) {
            return errorResponse(res, 400, 'COORDINATES_REQUIRED', 'Latitude and longitude are required');
        }

        const locations = await findLocationsNearby(
            parseFloat(latitude),
            parseFloat(longitude),
            parseInt(radius),
            parseInt(limit)
        );

        return successResponse(res, 200, 'Nearby locations retrieved successfully', {
            locations,
            center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            radius: parseInt(radius)
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLocation,
    listLocations,
    getLocation,
    getNearbyLocations
};
