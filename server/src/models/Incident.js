const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
    incident_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    incident_sender_id: {
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
    sender_email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    sender_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    location_id: {
        type: DataTypes.STRING(50),
        allowNull: true, // Now nullable since we use map_location for text descriptions
        references: {
            model: 'locations',
            key: 'location_id'
        }
    },
    incident_type: {
        type: DataTypes.ENUM(
            'Theft', 'Medical', 'Fire', 'Suspicious Activity',
            'Maintenance', 'Violence', 'Emergency Panic', 'Other'
        ),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 2000]
        }
    },
    status: {
        type: DataTypes.ENUM(
            'New', 'In Progress', 'Escalated', 'Resolved',
            'Closed', 'Rejected', 'Cancelled'
        ),
        allowNull: false,
        defaultValue: 'New'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
        allowNull: false,
        defaultValue: 'Medium'
    },
    date_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    media_urls: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: []
    },
    assigned_to: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    response_time: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    resolution_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    escalation_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    severity_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 10
        }
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        validate: {
            min: -90,
            max: 90
        }
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        validate: {
            min: -180,
            max: 180
        }
    },
    map_location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    evidence_files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    is_anonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status_history: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    resolved_at: {
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
    tableName: 'incidents',
    indexes: [
        { fields: ['incident_sender_id'] },
        { fields: ['location_id'] },
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['date_time'] },
        { fields: ['status', 'date_time'] },
        { fields: ['assigned_to'] }
    ]
});

module.exports = Incident;
