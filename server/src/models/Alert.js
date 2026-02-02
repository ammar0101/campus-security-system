const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
    alert_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    alert_sender_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    sender_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    sender_role: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    sender_badge_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 500]
        }
    },
    severity: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
        allowNull: false,
        defaultValue: 'Medium'
    },
    time_sent: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(
            'Draft', 'Approved', 'Broadcasting', 'Delivered',
            'Failed', 'Cancelled', 'Archived'
        ),
        allowNull: false,
        defaultValue: 'Draft'
    },
    target_roles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    target_zones: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    specific_users: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    related_incident_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: 'incidents',
            key: 'incident_id'
        }
    },
    alert_type: {
        type: DataTypes.ENUM(
            'Emergency', 'Weather', 'Lockdown', 'Evacuation',
            'All Clear', 'Maintenance', 'General'
        ),
        allowNull: false
    },
    requires_acknowledgment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    acknowledgment_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    delivery_stats: {
        type: DataTypes.JSONB,
        defaultValue: {
            sent: 0,
            delivered: 0,
            failed: 0,
            acknowledged: 0
        }
    },
    broadcasted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancel_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'alerts',
    indexes: [
        { fields: ['alert_sender_id'] },
        { fields: ['status'] },
        { fields: ['severity'] },
        { fields: ['time_sent'] },
        { fields: ['expires_at'] },
        { fields: ['status', 'time_sent'] }
    ]
});

module.exports = Alert;
