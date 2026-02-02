const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Admin = require('./Admin');
const SecurityStaff = require('./SecurityStaff');
const Student = require('./Student');
const Visitor = require('./Visitor');
const Incident = require('./Incident');
const Location = require('./Location');
const Alert = require('./Alert');
const AlertRecipient = require('./AlertRecipient');
const AlertLocation = require('./AlertLocation');
const Message = require('./Message');
const SystemSetting = require('./SystemSetting');
const AuditLog = require('./AuditLog');
const Analytics = require('./Analytics');

// Define relationships

// User relationships
User.hasOne(Admin, { foreignKey: 'user_id', as: 'adminProfile' });
User.hasOne(SecurityStaff, { foreignKey: 'user_id', as: 'securityStaffProfile' });
User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile' });
User.hasOne(Visitor, { foreignKey: 'user_id', as: 'visitorProfile' });
User.hasMany(Incident, { foreignKey: 'incident_sender_id', as: 'incidents' });
User.hasMany(Alert, { foreignKey: 'alert_sender_id', as: 'alerts' });
User.hasMany(Message, { foreignKey: 'sender_user_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_user_id', as: 'receivedMessages' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

// Role profile relationships
Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SecurityStaff.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Visitor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Incident relationships
Incident.belongsTo(User, { foreignKey: 'incident_sender_id', as: 'sender' });
Incident.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// Location relationships
Location.hasMany(Incident, { foreignKey: 'location_id', as: 'incidents' });

// Alert relationships
Alert.belongsTo(User, { foreignKey: 'alert_sender_id', as: 'sender' });
Alert.belongsTo(Incident, { foreignKey: 'related_incident_id', as: 'relatedIncident' });
Alert.hasMany(AlertRecipient, { foreignKey: 'alert_id', as: 'recipients' });
Alert.belongsToMany(Location, {
    through: AlertLocation,
    foreignKey: 'alert_id',
    otherKey: 'location_id',
    as: 'affectedLocations'
});

// AlertRecipient relationships
AlertRecipient.belongsTo(Alert, { foreignKey: 'alert_id', as: 'alert' });
AlertRecipient.belongsTo(User, { foreignKey: 'alert_receiver_id', as: 'recipient' });

// AlertLocation relationships
AlertLocation.belongsTo(Alert, { foreignKey: 'alert_id', as: 'alert' });
AlertLocation.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// Message relationships
Message.belongsTo(User, { foreignKey: 'sender_user_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_user_id', as: 'receiver' });
Message.belongsTo(Incident, { foreignKey: 'related_incident_id', as: 'relatedIncident' });

// SystemSetting relationships
SystemSetting.belongsTo(User, { foreignKey: 'last_modified_by', as: 'modifiedBy' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export all models
module.exports = {
    sequelize,
    User,
    Admin,
    SecurityStaff,
    Student,
    Visitor,
    Incident,
    Location,
    Alert,
    AlertRecipient,
    AlertLocation,
    Message,
    SystemSetting,
    AuditLog,
    Analytics
};
