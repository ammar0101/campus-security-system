const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for login attempts
 */
const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5,
    message: {
        success: false,
        error: {
            code: 'LOGIN_RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts from this IP, please try again after 15 minutes.',
            timestamp: new Date().toISOString()
        }
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for password reset requests
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        error: {
            code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
            message: 'Too many password reset requests, please try again later.',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for incident creation
 */
const incidentCreationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: {
        success: false,
        error: {
            code: 'INCIDENT_CREATION_LIMIT_EXCEEDED',
            message: 'Too many incident reports, please wait before creating more.',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    loginLimiter,
    passwordResetLimiter,
    incidentCreationLimiter
};
