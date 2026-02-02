const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authenticate);

// Create and broadcast alert (Security Staff and Admin only)
router.post(
    '/',
    requireRole('SecurityStaff', 'Admin'),
    auditLogger('ALERT_BROADCAST', 'Alert'),
    alertController.createAlert
);

// List alerts
router.get('/', alertController.listAlerts);

// Get alert details
router.get('/:alertID', alertController.getAlert);

// Acknowledge alert
router.post('/:alertID/acknowledge', alertController.acknowledgeAlert);

// Cancel alert (Admin or sender only)
router.delete(
    '/:alertID',
    auditLogger('DELETE', 'Alert'),
    alertController.cancelAlert
);

module.exports = router;
