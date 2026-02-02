/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                errors,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field';
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: `A record with this ${field} already exists`,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'FOREIGN_KEY_ERROR',
                message: 'Referenced record does not exist',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    // Sequelize database connection error
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Database connection error',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    // JWT errors (should be caught by auth middleware, but just in case)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size exceeds maximum allowed size';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        }

        return res.status(400).json({
            success: false,
            error: {
                code: 'FILE_UPLOAD_ERROR',
                message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred';

    return res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`,
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        }
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
