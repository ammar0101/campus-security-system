/**
 * Mock Push Notification Service (replaces Firebase Cloud Messaging)
 * Logs notifications to console instead of actually sending them
 */

/**
 * Send push notification to a single device
 */
const sendPushNotification = async (deviceToken, notification) => {
    console.log('\n📱 ===== MOCK PUSH NOTIFICATION =====');
    console.log(`Device Token: ${deviceToken}`);
    console.log(`Title: ${notification.title}`);
    console.log(`Body: ${notification.body}`);
    console.log(`Data:`, notification.data || {});
    console.log('====================================\n');

    return {
        success: true,
        messageId: `mock_push_${Date.now()}`,
        message: 'Push notification logged to console (mock mode)'
    };
};

/**
 * Send push notification to multiple devices
 */
const sendMulticastNotification = async (deviceTokens, notification) => {
    console.log('\n📱 ===== MOCK MULTICAST PUSH NOTIFICATION =====');
    console.log(`Devices: ${deviceTokens.length}`);
    console.log(`Title: ${notification.title}`);
    console.log(`Body: ${notification.body}`);
    console.log(`Data:`, notification.data || {});
    console.log('==============================================\n');

    return {
        success: true,
        successCount: deviceTokens.length,
        failureCount: 0,
        results: deviceTokens.map(token => ({
            token,
            success: true,
            messageId: `mock_push_${Date.now()}_${token.substring(0, 8)}`
        }))
    };
};

/**
 * Send new incident notification
 */
const sendIncidentNotification = async (deviceTokens, incident) => {
    const notification = {
        title: `New ${incident.priority} Priority Incident`,
        body: `${incident.incident_type} reported at ${incident.location?.building || 'Unknown location'}`,
        data: {
            type: 'incident',
            incidentId: incident.incident_id,
            priority: incident.priority,
            incidentType: incident.incident_type
        }
    };

    return await sendMulticastNotification(deviceTokens, notification);
};

/**
 * Send emergency panic notification
 */
const sendEmergencyNotification = async (deviceTokens, incident) => {
    const notification = {
        title: '🚨 EMERGENCY PANIC ACTIVATED',
        body: `Emergency at ${incident.location?.building || 'Unknown location'}. Immediate response required!`,
        data: {
            type: 'emergency',
            incidentId: incident.incident_id,
            priority: 'Critical',
            sound: 'emergency_alert.mp3'
        }
    };

    return await sendMulticastNotification(deviceTokens, notification);
};

/**
 * Send alert broadcast notification
 */
const sendAlertNotification = async (deviceTokens, alert) => {
    const notification = {
        title: `${alert.severity} Alert: ${alert.alert_type}`,
        body: alert.message,
        data: {
            type: 'alert',
            alertId: alert.alert_id,
            severity: alert.severity,
            alertType: alert.alert_type,
            requiresAcknowledgment: alert.requires_acknowledgment
        }
    };

    return await sendMulticastNotification(deviceTokens, notification);
};

/**
 * Send message notification
 */
const sendMessageNotification = async (deviceToken, message, sender) => {
    const notification = {
        title: `New message from ${sender.user_name}`,
        body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        data: {
            type: 'message',
            messageId: message.message_id,
            senderId: sender.user_id,
            priority: message.priority
        }
    };

    return await sendPushNotification(deviceToken, notification);
};

/**
 * Send incident status update notification
 */
const sendIncidentUpdateNotification = async (deviceTokens, incident) => {
    const notification = {
        title: 'Incident Status Updated',
        body: `Your incident ${incident.incident_id} is now ${incident.status}`,
        data: {
            type: 'incident_update',
            incidentId: incident.incident_id,
            status: incident.status
        }
    };

    return await sendMulticastNotification(deviceTokens, notification);
};

/**
 * Validate device token (mock - always returns true)
 */
const validateDeviceToken = async (token) => {
    return {
        valid: true,
        token
    };
};

/**
 * Remove invalid device tokens from user
 */
const removeInvalidTokens = async (userId, invalidTokens) => {
    console.log(`\n🗑️  Removing ${invalidTokens.length} invalid tokens for user ${userId}`);
    // In real implementation, this would update the user's device_tokens array
    return {
        success: true,
        removed: invalidTokens.length
    };
};

module.exports = {
    sendPushNotification,
    sendMulticastNotification,
    sendIncidentNotification,
    sendEmergencyNotification,
    sendAlertNotification,
    sendMessageNotification,
    sendIncidentUpdateNotification,
    validateDeviceToken,
    removeInvalidTokens
};
