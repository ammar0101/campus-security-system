const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.use(authenticate);

// Send message (Security Staff only)
router.post(
    '/',
    requireRole('SecurityStaff', 'Admin'),
    messageController.sendMessage
);

// List messages
router.get('/', messageController.listMessages);

// Mark message as read
router.patch('/:messageID/read', messageController.markAsRead);

// Delete message
router.delete('/:messageID', messageController.deleteMessage);

module.exports = router;
