const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authenticate);

// Create location (Admin only)
router.post(
    '/',
    requireRole('Admin'),
    auditLogger('CREATE', 'Location'),
    locationController.createLocation
);

// List locations
router.get('/', locationController.listLocations);

// Get nearby locations
router.get('/nearby', locationController.getNearbyLocations);

// Get location details
router.get('/:locationID', locationController.getLocation);

module.exports = router;
