const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { uploadProfileImage } = require('../services/uploadService');
const { auditLogger } = require('../middleware/auditLogger');

router.use(authenticate);

// List users (all authenticated users can view, filtered by controller)
router.get('/', userController.listUsers);

// Get user details
router.get('/:userID', userController.getUser);

// Update user profile
router.patch(
    '/:userID',
    uploadProfileImage,
    auditLogger('UPDATE', 'User'),
    userController.updateUser
);

// Change user status (Admin only)
router.patch(
    '/:userID/status',
    requireRole('Admin'),
    auditLogger('UPDATE', 'User Status'),
    userController.changeStatus
);

// Delete user (Admin only)
router.delete(
    '/:userID',
    requireRole('Admin'),
    auditLogger('DELETE', 'User'),
    userController.deleteUser
);

module.exports = router;
