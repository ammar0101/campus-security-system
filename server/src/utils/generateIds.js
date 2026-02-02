const crypto = require('crypto');

/**
 * Generate unique IDs for different entities
 */

const generateRandom6 = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const generateUserId = () => {
    return `USR_${Date.now()}_${generateRandom6()}`;
};

const generateIncidentId = () => {
    return `INC_${Date.now()}_${generateRandom6()}`;
};

const generateLocationId = () => {
    return `LOC_${Date.now()}_${generateRandom6()}`;
};

const generateAlertId = () => {
    return `ALT_${Date.now()}_${generateRandom6()}`;
};

const generateMessageId = () => {
    return `MSG_${Date.now()}_${generateRandom6()}`;
};

const generateVisitorPassNumber = () => {
    return `VIS_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const generateBadgeNumber = async () => {
    const { SecurityStaff } = require('../models');

    // Get the count of existing security staff
    const count = await SecurityStaff.count();
    const nextNumber = (count + 1).toString().padStart(3, '0');

    return `BADGE_${nextNumber}`;
};

module.exports = {
    generateRandom6,
    generateUserId,
    generateIncidentId,
    generateLocationId,
    generateAlertId,
    generateMessageId,
    generateVisitorPassNumber,
    generateBadgeNumber
};
