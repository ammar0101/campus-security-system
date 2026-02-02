const { Alert, AlertRecipient, AlertLocation, User, Location, Incident } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { generateAlertId } = require('../utils/generateIds');
const { sendAlertNotification } = require('../services/notificationService');
const { sendAlertEmail } = require('../services/emailService');
const { Op } = require('sequelize');

/**
 * Create and broadcast alert
 */
const createAlert = async (req, res, next) => {
    try {
        const {
            message,
            alertType,
            severity,
            targetAudience,
            requiresAcknowledgment = false,
            expiresAt,
            relatedIncidentID,
            affectedLocations = []
        } = req.body;

        // Validate
        if (!message || !alertType || !severity || !expiresAt) {
            return errorResponse(res, 400, 'MISSING_FIELDS', 'Message, alert type, severity, and expiration date are required');
        }

        if (!targetAudience || (!targetAudience.roles?.length && !targetAudience.specificUsers?.length)) {
            return errorResponse(res, 400, 'TARGET_REQUIRED', 'At least one target role or specific user must be selected');
        }

        const expiryDate = new Date(expiresAt);
        if (expiryDate <= new Date()) {
            return errorResponse(res, 400, 'INVALID_EXPIRY', 'Expiration date must be in the future');
        }

        // Create alert
        const alertId = generateAlertId();
        const alert = await Alert.create({
            alert_id: alertId,
            alert_sender_id: req.user.userID,
            sender_name: req.user.userName,
            sender_role: req.user.role,
            sender_badge_number: req.user.badgeNumber || null,
            message,
            alert_type: alertType,
            severity,
            expires_at: expiresAt,
            target_roles: targetAudience.roles || [],
            target_zones: targetAudience.zones || [],
            specific_users: targetAudience.specificUsers || [],
            related_incident_id: relatedIncidentID || null,
            requires_acknowledgment: requiresAcknowledgment,
            status: 'Broadcasting',
            broadcasted_at: new Date()
        });

        // Determine target users
        const where = { status: 'Active' };
        const orConditions = [];

        if (targetAudience.roles?.length) {
            orConditions.push({ role: { [Op.in]: targetAudience.roles } });
        }

        if (targetAudience.specificUsers?.length) {
            orConditions.push({ user_id: { [Op.in]: targetAudience.specificUsers } });
        }

        if (orConditions.length) {
            where[Op.or] = orConditions;
        }

        if (targetAudience.zones?.length && targetAudience.roles?.length) {
            where.zone = { [Op.in]: targetAudience.zones };
        }

        const targetUsers = await User.findAll({ where });

        // Create AlertRecipient records
        const recipients = await Promise.all(
            targetUsers.map(user =>
                AlertRecipient.create({
                    alert_id: alertId,
                    alert_receiver_id: user.user_id,
                    delivery_status: 'Pending'
                })
            )
        );

        // Create AlertLocation records
        if (affectedLocations.length) {
            await Promise.all(
                affectedLocations.map(loc =>
                    AlertLocation.create({
                        alert_id: alertId,
                        location_id: loc.locationID,
                        affected_area: loc.affectedArea,
                        evacuation_route: loc.evacuationRoute,
                        safe_zone: loc.safeZone
                    })
                )
            );
        }

        // Send push notifications
        const deviceTokens = targetUsers
            .flatMap(user => user.device_tokens || [])
            .filter(token => token);

        let deliveryStats = { sent: recipients.length, delivered: 0, failed: 0 };

        if (deviceTokens.length > 0) {
            const result = await sendAlertNotification(deviceTokens, alert);
            deliveryStats.delivered = result.successCount || deviceTokens.length;
            deliveryStats.failed = result.failureCount || 0;
        }

        // Send emails for critical alerts
        if (severity === 'Critical') {
            await sendAlertEmail(targetUsers, alert);
        }

        // Update delivery stats
        await alert.update({ delivery_stats: deliveryStats });

        // Emit socket event
        if (global.io) {
            targetUsers.forEach(user => {
                global.io.to(user.user_id).emit('alert:broadcast', {
                    alert: alert.toJSON()
                });
            });
        }

        return successResponse(res, 201, 'Alert is being broadcast now', {
            alertID: alert.alert_id,
            status: alert.status,
            timeSent: alert.time_sent,
            expiresAt: alert.expires_at,
            targetCount: recipients.length,
            estimatedDeliveryTime: '15-30 seconds'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List alerts
 */
const listAlerts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            severity,
            alertType,
            dateFrom,
            dateTo,
            activeOnly = false
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};

        // Role-based filtering
        if (req.user.role === 'Student' || req.user.role === 'Visitor') {
            // Only show alerts where user is a recipient
            const recipientAlerts = await AlertRecipient.findAll({
                where: { alert_receiver_id: req.user.userID },
                attributes: ['alert_id']
            });
            where.alert_id = { [Op.in]: recipientAlerts.map(r => r.alert_id) };
        }

        if (status) where.status = status;
        if (severity) where.severity = severity;
        if (alertType) where.alert_type = alertType;

        if (activeOnly) {
            where.status = { [Op.in]: ['Broadcasting', 'Delivered'] };
            where.expires_at = { [Op.gt]: new Date() };
        }

        if (dateFrom || dateTo) {
            where.time_sent = {};
            if (dateFrom) where.time_sent[Op.gte] = new Date(dateFrom);
            if (dateTo) where.time_sent[Op.lte] = new Date(dateTo);
        }

        const { count, rows: alerts } = await Alert.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['time_sent', 'DESC']]
        });

        // Get user's acknowledgment status for each alert
        const alertsWithStatus = await Promise.all(
            alerts.map(async (alert) => {
                const alertData = alert.toJSON();

                if (req.user.role === 'Student' || req.user.role === 'Visitor') {
                    const recipient = await AlertRecipient.findOne({
                        where: {
                            alert_id: alert.alert_id,
                            alert_receiver_id: req.user.userID
                        }
                    });

                    alertData.myStatus = recipient?.delivery_status;
                    alertData.myAcknowledgedAt = recipient?.acknowledged_at;
                }

                return alertData;
            })
        );

        const activeAlertsCount = await Alert.count({
            where: {
                status: { [Op.in]: ['Broadcasting', 'Delivered'] },
                expires_at: { [Op.gt]: new Date() }
            }
        });

        return successResponse(res, 200, 'Alerts retrieved successfully', {
            alerts: alertsWithStatus,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)),
                totalCount: count,
                limit: parseInt(limit)
            },
            activeAlertsCount
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get alert details
 */
const getAlert = async (req, res, next) => {
    try {
        const { alertID } = req.params;

        const alert = await Alert.findOne({
            where: { alert_id: alertID },
            include: [{
                model: Location,
                as: 'affectedLocations',
                through: { attributes: ['affected_area', 'evacuation_route', 'safe_zone'] }
            }]
        });

        if (!alert) {
            return errorResponse(res, 404, 'ALERT_NOT_FOUND', 'Alert not found');
        }

        // Check if user is a recipient
        if (req.user.role === 'Student' || req.user.role === 'Visitor') {
            const recipient = await AlertRecipient.findOne({
                where: {
                    alert_id: alertID,
                    alert_receiver_id: req.user.userID
                }
            });

            if (!recipient) {
                return errorResponse(res, 403, 'FORBIDDEN', 'You do not have access to this alert');
            }

            // Mark as read
            if (!recipient.read_at) {
                await recipient.update({
                    read_at: new Date(),
                    delivery_status: 'Read'
                });
            }
        }

        return successResponse(res, 200, 'Alert retrieved successfully', alert.toJSON());
    } catch (error) {
        next(error);
    }
};

/**
 * Acknowledge alert
 */
const acknowledgeAlert = async (req, res, next) => {
    try {
        const { alertID } = req.params;

        const recipient = await AlertRecipient.findOne({
            where: {
                alert_id: alertID,
                alert_receiver_id: req.user.userID
            }
        });

        if (!recipient) {
            return errorResponse(res, 404, 'RECIPIENT_NOT_FOUND', 'You are not a recipient of this alert');
        }

        if (recipient.acknowledged_at) {
            return errorResponse(res, 400, 'ALREADY_ACKNOWLEDGED', 'You have already acknowledged this alert');
        }

        await recipient.update({
            acknowledged_at: new Date(),
            delivery_status: 'Acknowledged'
        });

        // Update alert acknowledgment count
        const alert = await Alert.findOne({ where: { alert_id: alertID } });
        await alert.increment('acknowledgment_count');

        // Emit socket event to alert sender
        if (global.io) {
            global.io.to(alert.alert_sender_id).emit('alert:acknowledged', {
                alertID,
                userID: req.user.userID,
                userName: req.user.userName,
                acknowledgedAt: recipient.acknowledged_at,
                totalAcknowledged: alert.acknowledgment_count + 1
            });
        }

        return successResponse(res, 200, 'Alert acknowledged successfully', {
            alertID,
            acknowledgedAt: recipient.acknowledged_at
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel alert
 */
const cancelAlert = async (req, res, next) => {
    try {
        const { alertID } = req.params;
        const { reason } = req.body;

        const alert = await Alert.findOne({ where: { alert_id: alertID } });

        if (!alert) {
            return errorResponse(res, 404, 'ALERT_NOT_FOUND', 'Alert not found');
        }

        // Check permissions
        if (req.user.role !== 'Admin' && alert.alert_sender_id !== req.user.userID) {
            return errorResponse(res, 403, 'FORBIDDEN', 'Only the sender or an admin can cancel this alert');
        }

        await alert.update({
            status: 'Cancelled',
            cancelled_at: new Date(),
            cancel_reason: reason
        });

        // Emit socket event to all recipients
        if (global.io) {
            global.io.emit('alert:cancelled', {
                alertID,
                reason
            });
        }

        return successResponse(res, 200, 'Alert has been cancelled', {
            alertID,
            status: 'Cancelled',
            cancelledAt: alert.cancelled_at
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAlert,
    listAlerts,
    getAlert,
    acknowledgeAlert,
    cancelAlert
};
