/**
 * Utility functions untuk API responses
 */

/**
 * Format success response
 * @param {any} data - Data yang akan di-return
 * @param {string} message - Custom message (optional)
 * @returns {object} Formatted response
 */
function successResponse(data, message = 'Success') {
    return {
        success: true,
        message,
        data
    };
}

/**
 * Format error response
 * @param {string} error - Error type/code
 * @param {string} message - Error message
 * @param {any} details - Additional details (optional)
 * @returns {object} Formatted response
 */
function errorResponse(error, message, details = null) {
    return {
        success: false,
        error,
        message,
        ...(details && { details })
    };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
}

/**
 * Validate antrian status
 * @param {string} status - Status to validate
 * @returns {boolean}
 */
function isValidStatus(status) {
    const validStatuses = ['menunggu', 'dilayani', 'selesai', 'batal'];
    return validStatuses.includes(status);
}

/**
 * Generate pagination params
 * @param {object} query - Query parameters
 * @returns {object} Pagination object
 */
function getPaginationParams(query) {
    const skip = Math.max(0, parseInt(query.skip) || 0);
    const limit = Math.min(1000, Math.max(1, parseInt(query.limit) || 20));

    return { skip, limit };
}

/**
 * Handle async route errors
 * @param {Function} fn - Async handler
 * @returns {Function} Wrapped handler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    successResponse,
    errorResponse,
    isValidEmail,
    sanitizeString,
    isValidStatus,
    getPaginationParams,
    asyncHandler
};
