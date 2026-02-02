/**
 * Mock Email Service (replaces Nodemailer)
 * Logs emails to console instead of actually sending them
 */

const sendEmail = async ({ to, subject, html, text }) => {
    console.log('\n📧 ===== MOCK EMAIL =====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${text || html}`);
    console.log('========================\n');

    return {
        success: true,
        messageId: `mock_${Date.now()}`,
        message: 'Email logged to console (mock mode)'
    };
};

/**
 * Send registration confirmation email
 */
const sendRegistrationEmail = async (user) => {
    const subject = 'Welcome to Campus Security System';
    const text = `
    Hello ${user.user_name},

    Thank you for registering with the Campus Security System.
    
    Your account is currently pending approval. You will receive another email once your account has been approved by an administrator.

    Account Details:
    - Email: ${user.email}
    - Role: ${user.role}
    - Registration Date: ${new Date().toLocaleString()}

    If you did not create this account, please contact security@campus.edu immediately.

    Best regards,
    Campus Security Team
  `;

    return await sendEmail({
        to: user.email,
        subject,
        text
    });
};

/**
 * Send account approval email
 */
const sendApprovalEmail = async (user) => {
    const subject = 'Your Account Has Been Approved';
    const text = `
    Hello ${user.user_name},

    Great news! Your Campus Security System account has been approved.

    You can now log in at: ${process.env.CLIENT_URL}/login

    If you have any questions, please contact security@campus.edu.

    Best regards,
    Campus Security Team
  `;

    return await sendEmail({
        to: user.email,
        subject,
        text
    });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const subject = 'Password Reset Request';
    const text = `
    Hello ${user.user_name},

    You requested a password reset for your Campus Security System account.

    Click the link below to reset your password (valid for 1 hour):
    ${resetUrl}

    If you did not request this reset, please ignore this email and your password will remain unchanged.

    Best regards,
    Campus Security Team
  `;

    return await sendEmail({
        to: user.email,
        subject,
        text
    });
};

/**
 * Send critical alert email
 */
const sendAlertEmail = async (recipients, alert) => {
    const subject = `[${alert.severity}] Campus Alert: ${alert.alert_type}`;
    const text = `
    CAMPUS SECURITY ALERT

    Severity: ${alert.severity}
    Type: ${alert.alert_type}
    
    Message:
    ${alert.message}

    Sent: ${new Date(alert.time_sent).toLocaleString()}
    Expires: ${new Date(alert.expires_at).toLocaleString()}

    This is an automated message from the Campus Security System.
  `;

    // Send to all recipients
    const promises = recipients.map(recipient =>
        sendEmail({
            to: recipient.email,
            subject,
            text
        })
    );

    return await Promise.all(promises);
};

/**
 * Send emergency panic notification email
 */
const sendEmergencyEmail = async (incident, emergencyContacts) => {
    const subject = '🚨 EMERGENCY ALERT - Immediate Attention Required';
    const text = `
    EMERGENCY PANIC BUTTON ACTIVATED

    Incident ID: ${incident.incident_id}
    Time: ${new Date(incident.date_time).toLocaleString()}
    Location: ${incident.location?.building || 'Unknown'}
    
    A user has activated the emergency panic button. Security staff have been notified and are responding.

    This is an automated emergency notification.
  `;

    const recipients = [
        process.env.EMAIL_USER,
        ...emergencyContacts.map(contact => contact.email).filter(Boolean)
    ];

    const promises = recipients.map(to =>
        sendEmail({
            to,
            subject,
            text
        })
    );

    return await Promise.all(promises);
};

/**
 * Send incident status update email
 */
const sendIncidentUpdateEmail = async (user, incident) => {
    const subject = `Incident ${incident.incident_id} Status Updated`;
    const text = `
    Hello ${user.user_name},

    Your incident report has been updated.

    Incident ID: ${incident.incident_id}
    Type: ${incident.incident_type}
    New Status: ${incident.status}
    Priority: ${incident.priority}

    ${incident.resolution_notes ? `Resolution Notes: ${incident.resolution_notes}` : ''}

    You can view full details at: ${process.env.CLIENT_URL}/incidents/${incident.incident_id}

    Best regards,
    Campus Security Team
  `;

    return await sendEmail({
        to: user.email,
        subject,
        text
    });
};

module.exports = {
    sendEmail,
    sendRegistrationEmail,
    sendApprovalEmail,
    sendPasswordResetEmail,
    sendAlertEmail,
    sendEmergencyEmail,
    sendIncidentUpdateEmail
};
