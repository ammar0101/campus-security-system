const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { auditLogger } = require('../middleware/auditLogger');

// Public routes
router.post('/register', authController.register);
router.post('/login', loginLimiter, auditLogger('LOGIN'), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, auditLogger('LOGOUT'), authController.logout);
router.post('/create-staff', authenticate, requireRole('Admin'), authController.createStaffAccount);

module.exports = router;
