const { errorResponse } = require('../utils/response');

/**
 * Role-based access control middleware
 * Usage: requireRole('Admin') or requireRole('Admin', 'SecurityStaff')
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'AUTH_REQUIRED', 'Authentication required');
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                403,
                'FORBIDDEN',
                `Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(' or ')}`
            );
        }

        next();
    };
};

/**
 * Check if user can access a specific resource
 * For example, students can only view their own incidents
 */
const canAccessResource = (resourceOwnerId) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'AUTH_REQUIRED', 'Authentication required');
        }

        // Admin and SecurityStaff can access all resources
        if (req.user.role === 'Admin' || req.user.role === 'SecurityStaff') {
            return next();
        }

        // Others can only access their own resources
        if (req.user.userID !== resourceOwnerId) {
            return errorResponse(res, 403, 'FORBIDDEN', 'You do not have permission to access this resource');
        }

        next();
    };
};

/**
 * Check if user is the owner of a resource or has elevated privileges
 */
const isOwnerOrAdmin = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'AUTH_REQUIRED', 'Authentication required');
        }

        // Admin always has access
        if (req.user.role === 'Admin') {
            return next();
        }

        // Get the owner ID (can be a function or direct value)
        const ownerId = typeof getOwnerId === 'function'
            ? await getOwnerId(req)
            : getOwnerId;

        if (req.user.userID !== ownerId) {
            return errorResponse(res, 403, 'FORBIDDEN', 'You do not have permission to modify this resource');
        }

        next();
    };
};

module.exports = {
    requireRole,
    canAccessResource,
    isOwnerOrAdmin
};
