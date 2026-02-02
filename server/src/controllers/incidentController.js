const { Incident, Location, User, SecurityStaff } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { generateIncidentId, generateLocationId } = require('../utils/generateIds');
const { findNearestLocation } = require('../utils/findNearestLocation');
const { processUploadedFiles } = require('../services/uploadService');
const { sendIncidentUpdateEmail, sendEmergencyEmail } = require('../services/emailService');
const { sendIncidentNotification, sendEmergencyNotification } = require('../services/notificationService');
const { Op } = require('sequelize');

/**
 * Create a new incident report
 */
const createIncident = async (req, res, next) => {
    try {
        const {
            incidentType,
            description,
            locationID,
            latitude,
            longitude,
            isAnonymous = false,
            priority = 'Medium'
        } = req.body;

        // Validate required fields
        if (!incidentType || !description || !locationID) {
            return errorResponse(res, 400, 'MISSING_FIELDS', 'Incident type, description, and location are required');
        }

        // locationID now contains the location description text
        const locationDescription = locationID;

        // Process uploaded files
        const mediaUrls = await processUploadedFiles(req.files);

        // Create incident
        const incidentId = generateIncidentId();
        const incident = await Incident.create({
            incident_id: incidentId,
            incident_sender_id: req.user.userID,
            sender_name: isAnonymous ? null : req.user.userName,
            sender_role: isAnonymous ? null : req.user.role,
            sender_email: isAnonymous ? null : req.user.email,
            sender_phone: isAnonymous ? null : req.user.phoneNumber,
            location_id: null, // No longer using location ID from database
            map_location: locationDescription, // Store the text description
            incident_type: incidentType,
            description,
            status: 'New',
            priority,
            latitude: latitude || null,
            longitude: longitude || null,
            is_anonymous: isAnonymous,
            media_urls: mediaUrls,
            status_history: [{
                status: 'New',
                timestamp: new Date(),
                updatedBy: 'System'
            }]
        });

        // Get all on-duty security staff for notifications
        const onDutyStaff = await SecurityStaff.findAll({
            where: { is_on_duty: true },
            include: [{
                model: User,
                as: 'user',
                attributes: ['device_tokens']
            }]
        });

        // Collect device tokens
        const deviceTokens = onDutyStaff
            .flatMap(staff => staff.user?.device_tokens || [])
            .filter(token => token);

        // Send push notifications
        if (deviceTokens.length > 0) {
            await sendIncidentNotification(deviceTokens, incident.toJSON());
        }

        // Emit socket event (will be handled by socket service)
        if (global.io) {
            global.io.to('security-staff').emit('incident:created', {
                incident: incident.toJSON(),
                isEmergency: false
            });
        }

        return successResponse(res, 201, 'Incident reported successfully', {
            incidentID: incident.incident_id,
            incidentType: incident.incident_type,
            status: incident.status,
            priority: incident.priority,
            dateTime: incident.date_time,
            locationID: incident.location_id,
            mediaUrl: incident.media_urls,
            isAnonymous: incident.is_anonymous
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Emergency panic button activation
 */
const emergencyPanic = async (req, res, next) => {
    try {
        const { currentLocation, accuracyMeters } = req.body;

        if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
            return errorResponse(res, 400, 'LOCATION_REQUIRED', 'Current location (latitude and longitude) is required');
        }

        const { latitude, longitude } = currentLocation;

        // Find nearest location
        let location = await findNearestLocation(latitude, longitude, 200);

        // If no location found within 200m, create a new one
        if (!location) {
            const locationId = generateLocationId();
            location = await Location.create({
                location_id: locationId,
                building: 'Emergency Location',
                latitude,
                longitude,
                map_location: `Emergency location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                zone: req.user.zone || 'Unknown',
                location_type: 'Other'
            });
        }

        // Create critical priority incident
        const incidentId = generateIncidentId();
        const incident = await Incident.create({
            incident_id: incidentId,
            incident_sender_id: req.user.userID,
            sender_name: req.user.userName,
            sender_role: req.user.role,
            sender_email: req.user.email,
            location_id: location.location_id,
            incident_type: 'Emergency Panic',
            description: `Emergency panic button activated. GPS accuracy: ${accuracyMeters ? accuracyMeters + 'm' : 'Unknown'}`,
            status: 'New',
            priority: 'Critical',
            latitude: latitude,
            longitude: longitude,
            is_anonymous: false,
            status_history: [{
                status: 'New',
                timestamp: new Date(),
                updatedBy: 'System'
            }]
        });

        // Get ALL on-duty security staff
        const onDutyStaff = await SecurityStaff.findAll({
            where: { is_on_duty: true },
            include: [{
                model: User,
                as: 'user',
                attributes: ['device_tokens', 'email']
            }]
        });

        // Send emergency push notifications
        const deviceTokens = onDutyStaff
            .flatMap(staff => staff.user?.device_tokens || [])
            .filter(token => token);

        if (deviceTokens.length > 0) {
            await sendEmergencyNotification(deviceTokens, {
                ...incident.toJSON(),
                location
            });
        }

        // Send emergency email
        const emergencyContacts = [];
        if (req.user.role === 'Student') {
            const { Student } = require('../models');
            const student = await Student.findOne({ where: { user_id: req.user.userID } });
            if (student && student.emergency_contacts) {
                emergencyContacts.push(...student.emergency_contacts);
            }
        }

        await sendEmergencyEmail(incident, emergencyContacts);

        // Emit emergency socket event
        if (global.io) {
            global.io.to('security-staff').emit('incident:created', {
                incident: incident.toJSON(),
                isEmergency: true,
                location
            });
        }

        return successResponse(res, 201, 'EMERGENCY: Alert sent. Security has been notified. Stay in a safe location.', {
            incidentID: incident.incident_id,
            incidentType: incident.incident_type,
            status: incident.status,
            priority: incident.priority,
            dateTime: incident.date_time,
            location: {
                latitude,
                longitude,
                nearestBuilding: location.building,
                zone: location.zone
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List incidents with filtering and pagination
 */
const listIncidents = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            incidentType,
            priority,
            dateFrom,
            dateTo,
            locationID,
            zone,
            assignedTo,
            search,
            sortBy = 'date_time',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};

        // Role-based filtering
        if (req.user.role === 'Student' || req.user.role === 'Visitor') {
            // Students and visitors can only see their own incidents
            where.incident_sender_id = req.user.userID;
        }

        // Apply filters
        if (status) where.status = status;
        if (incidentType) where.incident_type = incidentType;
        if (priority) where.priority = priority;
        if (assignedTo) where.assigned_to = assignedTo;
        if (locationID) where.location_id = locationID;

        if (dateFrom || dateTo) {
            where.date_time = {};
            if (dateFrom) where.date_time[Op.gte] = new Date(dateFrom);
            if (dateTo) where.date_time[Op.lte] = new Date(dateTo);
        }

        if (search) {
            where[Op.or] = [
                { incident_id: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { sender_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Include location for zone filtering
        const include = [{
            model: Location,
            as: 'location',
            attributes: ['location_id', 'building', 'floor', 'room', 'latitude', 'longitude', 'zone', 'map_location']
        }];

        if (zone) {
            include[0].where = { zone };
        }

        // Get incidents
        const { count, rows: incidents } = await Incident.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder.toUpperCase()]],
            distinct: true
        });

        // Get status counts for stats
        const stats = await Incident.findAll({
            attributes: [
                'status',
                [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
            ],
            where: req.user.role === 'Student' || req.user.role === 'Visitor'
                ? { incident_sender_id: req.user.userID }
                : {},
            group: ['status'],
            raw: true
        });

        const statusCounts = {
            new: 0,
            inProgress: 0,
            escalated: 0,
            resolved: 0,
            closed: 0,
            critical: 0
        };

        stats.forEach(stat => {
            const key = stat.status.toLowerCase().replace(' ', '');
            statusCounts[key] = parseInt(stat.count);
        });

        // Get critical count
        const criticalCount = await Incident.count({
            where: {
                priority: 'Critical',
                status: { [Op.notIn]: ['Resolved', 'Closed', 'Cancelled'] },
                ...(req.user.role === 'Student' || req.user.role === 'Visitor'
                    ? { incident_sender_id: req.user.userID }
                    : {})
            }
        });

        statusCounts.critical = criticalCount;

        return successResponse(res, 200, 'Incidents retrieved successfully', {
            incidents: incidents.map(inc => ({
                ...inc.toJSON(),
                senderDetails: inc.is_anonymous ? null : {
                    name: inc.sender_name,
                    role: inc.sender_role,
                    email: inc.sender_email
                }
            })),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)),
                totalCount: count,
                limit: parseInt(limit),
                hasNextPage: offset + incidents.length < count,
                hasPrevPage: parseInt(page) > 1
            },
            stats: statusCounts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single incident details
 */
const getIncident = async (req, res, next) => {
    try {
        const { incidentID } = req.params;

        const incident = await Incident.findOne({
            where: { incident_id: incidentID },
            include: [{
                model: Location,
                as: 'location'
            }]
        });

        if (!incident) {
            return errorResponse(res, 404, 'INCIDENT_NOT_FOUND', 'Incident not found');
        }

        // Check access permissions
        if (req.user.role === 'Student' || req.user.role === 'Visitor') {
            if (incident.incident_sender_id !== req.user.userID) {
                return errorResponse(res, 403, 'FORBIDDEN', 'You do not have permission to view this incident');
            }
        }

        // Increment view count
        await incident.increment('view_count');

        // Get assigned staff details if assigned
        let assignedStaffDetails = null;
        if (incident.assigned_to) {
            const staff = await SecurityStaff.findOne({
                where: { badge_number: incident.assigned_to },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['user_name', 'phone_number']
                }]
            });

            if (staff) {
                assignedStaffDetails = {
                    badgeNumber: staff.badge_number,
                    name: staff.user.user_name,
                    phone: staff.user.phone_number,
                    isOnDuty: staff.is_on_duty
                };
            }
        }

        return successResponse(res, 200, 'Incident retrieved successfully', {
            ...incident.toJSON(),
            reporter_name: incident.is_anonymous ? 'Anonymous' : incident.sender_name,
            senderDetails: incident.is_anonymous ? null : {
                name: incident.sender_name,
                role: incident.sender_role,
                email: incident.sender_email,
                phone: incident.sender_phone
            },
            assignedStaffDetails
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update incident status
 */
const updateStatus = async (req, res, next) => {
    try {
        const { incidentID } = req.params;
        const { status, resolutionNotes, escalationReason, assignedTo } = req.body;

        const incident = await Incident.findOne({ where: { incident_id: incidentID } });

        if (!incident) {
            return errorResponse(res, 404, 'INCIDENT_NOT_FOUND', 'Incident not found');
        }

        const previousStatus = incident.status;

        // Validate status transition
        const validTransitions = {
            'New': ['In Progress', 'Rejected', 'Cancelled'],
            'In Progress': ['Escalated', 'Resolved'],
            'Escalated': ['Resolved']
        };

        if (!validTransitions[previousStatus]?.includes(status)) {
            return errorResponse(res, 400, 'INVALID_TRANSITION', `Cannot change status from ${previousStatus} to ${status}`);
        }

        // Validate required fields
        if (status === 'Resolved' && (!resolutionNotes || resolutionNotes.length < 10)) {
            return errorResponse(res, 400, 'RESOLUTION_NOTES_REQUIRED', 'Resolution notes (min 10 characters) are required when resolving an incident');
        }

        if (status === 'Escalated' && (!escalationReason || escalationReason.length < 10)) {
            return errorResponse(res, 400, 'ESCALATION_REASON_REQUIRED', 'Escalation reason (min 10 characters) is required when escalating an incident');
        }

        // Calculate response time if transitioning from New
        let responseTime = incident.response_time;
        if (previousStatus === 'New' && !responseTime) {
            const now = new Date();
            const created = new Date(incident.date_time);
            responseTime = ((now - created) / 1000 / 60).toFixed(2); // Minutes
        }

        // Update incident
        const updates = {
            status,
            response_time: responseTime,
            status_history: [
                ...incident.status_history,
                {
                    status,
                    timestamp: new Date(),
                    updatedBy: req.user.role === 'SecurityStaff' ? assignedTo || 'Staff' : req.user.userName
                }
            ]
        };

        if (status === 'Resolved') {
            updates.resolution_notes = resolutionNotes;
            updates.resolved_at = new Date();
        }

        if (status === 'Escalated') {
            updates.escalation_reason = escalationReason;
        }

        if (assignedTo) {
            updates.assigned_to = assignedTo;
        }

        await incident.update(updates);

        // Notify incident reporter
        if (!incident.is_anonymous) {
            const reporter = await User.findOne({ where: { user_id: incident.incident_sender_id } });
            if (reporter) {
                await sendIncidentUpdateEmail(reporter, incident);

                if (reporter.device_tokens && reporter.device_tokens.length > 0) {
                    const { sendIncidentUpdateNotification } = require('../services/notificationService');
                    await sendIncidentUpdateNotification(reporter.device_tokens, incident);
                }
            }
        }

        // Emit socket event
        if (global.io) {
            global.io.emit('incident:updated', {
                incidentID: incident.incident_id,
                previousStatus,
                newStatus: status,
                updatedBy: req.user.userName,
                timestamp: new Date()
            });
        }

        return successResponse(res, 200, `Incident status updated to ${status}`, {
            incidentID: incident.incident_id,
            previousStatus,
            newStatus: status,
            updatedAt: incident.updated_at,
            responseTime,
            resolvedAt: incident.resolved_at
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update incident location
 */
const updateLocation = async (req, res, next) => {
    try {
        const { incidentID } = req.params;
        const { locationID, additionalNotes } = req.body;

        const incident = await Incident.findOne({ where: { incident_id: incidentID } });

        if (!incident) {
            return errorResponse(res, 404, 'INCIDENT_NOT_FOUND', 'Incident not found');
        }

        const location = await Location.findOne({ where: { location_id: locationID } });

        if (!location) {
            return errorResponse(res, 404, 'LOCATION_NOT_FOUND', 'Location not found');
        }

        const previousLocationID = incident.location_id;

        await incident.update({
            location_id: locationID,
            description: additionalNotes
                ? `${incident.description}\n\nLocation Update: ${additionalNotes}`
                : incident.description
        });

        // Emit socket event
        if (global.io) {
            global.io.emit('incident:updated', {
                incidentID: incident.incident_id,
                previousLocationID,
                newLocationID: locationID
            });
        }

        return successResponse(res, 200, 'Incident location updated', {
            incidentID: incident.incident_id,
            previousLocationID,
            newLocationID: locationID
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel incident
 */
const cancelIncident = async (req, res, next) => {
    try {
        const { incidentID } = req.params;
        const { cancelReason } = req.body;

        if (!cancelReason || cancelReason.length < 5) {
            return errorResponse(res, 400, 'CANCEL_REASON_REQUIRED', 'Cancel reason (min 5 characters) is required');
        }

        const incident = await Incident.findOne({ where: { incident_id: incidentID } });

        if (!incident) {
            return errorResponse(res, 404, 'INCIDENT_NOT_FOUND', 'Incident not found');
        }

        // Check permissions
        if (req.user.role !== 'Admin') {
            // Non-admin can only cancel their own incidents
            if (incident.incident_sender_id !== req.user.userID) {
                return errorResponse(res, 403, 'FORBIDDEN', 'You can only cancel your own incidents');
            }

            // Must be in New status
            if (incident.status !== 'New') {
                return errorResponse(res, 400, 'CANNOT_CANCEL', 'Only incidents in New status can be cancelled');
            }

            // Must be within cancel window
            const cancelWindowMinutes = parseInt(process.env.INCIDENT_CANCEL_WINDOW_MINUTES) || 10;
            const now = new Date();
            const created = new Date(incident.date_time);
            const minutesSinceCreation = (now - created) / 1000 / 60;

            if (minutesSinceCreation > cancelWindowMinutes) {
                return errorResponse(res, 400, 'CANCEL_WINDOW_EXPIRED', `Incidents can only be cancelled within ${cancelWindowMinutes} minutes of creation`);
            }
        }

        await incident.update({
            status: 'Cancelled',
            cancelled_at: new Date(),
            cancel_reason: cancelReason,
            status_history: [
                ...incident.status_history,
                {
                    status: 'Cancelled',
                    timestamp: new Date(),
                    updatedBy: req.user.userName
                }
            ]
        });

        // Notify assigned staff if any
        if (incident.assigned_to && global.io) {
            global.io.emit('incident:updated', {
                incidentID: incident.incident_id,
                status: 'Cancelled',
                cancelReason
            });
        }

        return successResponse(res, 200, 'Incident has been cancelled', {
            incidentID: incident.incident_id,
            status: 'Cancelled',
            cancelledAt: incident.cancelled_at,
            cancelReason: incident.cancel_reason
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's own incidents (for students)
 */
const getMyIncidents = async (req, res, next) => {
    try {
        const userId = req.user.userID;

        const incidents = await Incident.findAll({
            where: { incident_sender_id: userId },
            include: [{
                model: Location,
                as: 'location',
                attributes: ['location_id', 'building', 'floor', 'room', 'zone']
            }],
            order: [['date_time', 'DESC']],
            attributes: {
                exclude: ['location_id'] // Exclude FK as we have the relation
            }
        });

        return successResponse(res, 200, 'Your incidents retrieved successfully', {
            incidents: incidents.map(incident => ({
                incidentID: incident.incident_id,
                incidentType: incident.incident_type,
                description: incident.description,
                status: incident.status,
                priority: incident.priority,
                dateTime: incident.date_time,
                location: incident.location,
                latitude: incident.latitude,
                longitude: incident.longitude,
                mediaUrls: incident.media_urls,
                isAnonymous: incident.is_anonymous,
                statusHistory: incident.status_history
            })),
            total: incidents.length
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createIncident,
    emergencyPanic,
    listIncidents,
    getIncident,
    updateStatus,
    updateLocation,
    cancelIncident,
    getMyIncidents
};
