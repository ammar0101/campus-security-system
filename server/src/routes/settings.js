const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authenticate);
router.use(requireRole('Admin')); // All settings routes require admin

// Get all settings
router.get('/', settingsController.getAllSettings);

// Get specific setting
router.get('/:settingKey', settingsController.getSetting);

// Update setting
router.patch(
    '/:settingKey',
    auditLogger('UPDATE', 'System Setting'),
    settingsController.updateSetting
);

module.exports = router;
