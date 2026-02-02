const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { incidentCreationLimiter } = require('../middleware/rateLimiter');
const { uploadIncidentPhotos } = require('../services/uploadService');
const { auditLogger } = require('../middleware/auditLogger');

// All routes require authentication
router.use(authenticate);

// Create incident
router.post(
    '/',
    incidentCreationLimiter,
    (req, res, next) => {
        // Only apply multer if Content-Type is multipart/form-data
        if (req.is('multipart/form-data')) {
            return uploadIncidentPhotos(req, res, next);
        }
        // For JSON requests, skip multer and continue
        next();
    },
    auditLogger('CREATE', 'Incident'),
    incidentController.createIncident
);

// Emergency panic button
router.post(
    '/emergency-panic',
    auditLogger('CREATE', 'Emergency Incident'),
    incidentController.emergencyPanic
);

// Get current user's own incidents (students)
router.get('/my-incidents', incidentController.getMyIncidents);

// List incidents
router.get('/', incidentController.listIncidents);

// Get single incident
router.get('/:incidentID', incidentController.getIncident);

// Update incident status (Security Staff and Admin only)
router.patch(
    '/:incidentID/status',
    requireRole('SecurityStaff', 'Admin'),
    auditLogger('INCIDENT_UPDATE', 'Incident'),
    incidentController.updateStatus
);

// Update incident location (Security Staff and Admin only)
router.patch(
    '/:incidentID/location',
    requireRole('SecurityStaff', 'Admin'),
    auditLogger('UPDATE', 'Incident Location'),
    incidentController.updateLocation
);

// Cancel incident
router.delete(
    '/:incidentID',
    auditLogger('DELETE', 'Incident'),
    incidentController.cancelIncident
);

module.exports = router;
