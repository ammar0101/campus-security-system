/**
 * Standard response helpers for consistent API responses
 */

const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, code, message, errors = null) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            timestamp: new Date().toISOString(),
            path: res.req.originalUrl
        }
    };

    if (errors) {
        response.error.errors = errors;
    }

    return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, errors) => {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Validation failed', errors);
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse
};
