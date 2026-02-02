const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'AUTH_REQUIRED', 'Authentication token is required');
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return errorResponse(res, 401, 'TOKEN_REVOKED', 'Token has been revoked');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database
        const user = await User.findOne({
            where: { user_id: decoded.userID },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return errorResponse(res, 401, 'USER_NOT_FOUND', 'User associated with token not found');
        }

        if (user.status !== 'Active') {
            return errorResponse(res, 401, 'ACCOUNT_INACTIVE', `Account status is ${user.status}`);
        }

        // Attach user to request
        req.user = {
            userID: user.user_id,
            userName: user.user_name,
            email: user.email,
            role: user.role,
            zone: user.zone,
            status: user.status
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 401, 'INVALID_TOKEN', 'Invalid token');
        }
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 401, 'TOKEN_EXPIRED', 'Token has expired. Please refresh.');
        }
        return errorResponse(res, 500, 'AUTH_ERROR', 'Authentication error');
    }
};

/**
 * Add token to blacklist (for logout)
 */
const blacklistToken = (token) => {
    tokenBlacklist.add(token);

    // Auto-remove after expiry (15 minutes)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 15 * 60 * 1000);
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            where: { user_id: decoded.userID },
            attributes: { exclude: ['password'] }
        });

        if (user && user.status === 'Active') {
            req.user = {
                userID: user.user_id,
                userName: user.user_name,
                email: user.email,
                role: user.role,
                zone: user.zone
            };
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    authenticate,
    blacklistToken,
    optionalAuth
};
