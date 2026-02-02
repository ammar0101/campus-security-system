const { AuditLog } = require('../models');

/**
 * Middleware to log actions to audit log
 */
const auditLogger = (actionType, targetResource = null) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to capture response
        res.json = function (body) {
            // Only log if request was successful
            const status = body.success ? 'Success' : 'Failed';

            // Create audit log entry asynchronously (don't wait)
            setImmediate(async () => {
                try {
                    await AuditLog.create({
                        user_id: req.user?.userID || null,
                        action: generateActionDescription(req, actionType, targetResource),
                        action_type: actionType,
                        target_resource: targetResource,
                        target_resource_id: req.params.id || req.params.incidentID || req.params.alertID || req.params.userID || null,
                        changes: captureChanges(req, body),
                        ip_address: req.ip || req.connection.remoteAddress,
                        user_agent: req.get('user-agent'),
                        status,
                        error_message: status === 'Failed' ? body.error?.message : null
                    });
                } catch (error) {
                    console.error('Failed to create audit log:', error);
                }
            });

            // Call original json method
            return originalJson(body);
        };

        next();
    };
};

/**
 * Generate human-readable action description
 */
const generateActionDescription = (req, actionType, targetResource) => {
    const user = req.user ? req.user.userName : 'Anonymous';
    const method = req.method;
    const path = req.originalUrl;

    switch (actionType) {
        case 'LOGIN':
            return `${user} logged in`;
        case 'LOGOUT':
            return `${user} logged out`;
        case 'CREATE':
            return `${user} created ${targetResource}`;
        case 'UPDATE':
            return `${user} updated ${targetResource}`;
        case 'DELETE':
            return `${user} deleted ${targetResource}`;
        case 'ALERT_BROADCAST':
            return `${user} broadcast an alert`;
        case 'INCIDENT_UPDATE':
            return `${user} updated incident status`;
        default:
            return `${user} performed ${method} on ${path}`;
    }
};

/**
 * Capture changes for UPDATE actions
 */
const captureChanges = (req, responseBody) => {
    if (req.method === 'PUT' || req.method === 'PATCH') {
        return {
            before: req.originalData || null,
            after: req.body
        };
    }
    return null;
};

module.exports = {
    auditLogger
};
