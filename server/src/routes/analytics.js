const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.use(authenticate);

// Dashboard stats
router.get('/dashboard', analyticsController.getDashboardStats);

// Incident analytics
router.get('/incidents', analyticsController.getIncidentAnalytics);

// Export analytics (Admin only)
router.get(
    '/export',
    requireRole('Admin'),
    analyticsController.exportAnalytics
);

module.exports = router;
