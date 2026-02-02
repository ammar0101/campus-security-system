const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    action: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    action_type: {
        type: DataTypes.ENUM(
            'CREATE', 'READ', 'UPDATE', 'DELETE',
            'LOGIN', 'LOGOUT', 'ALERT_BROADCAST',
            'INCIDENT_UPDATE', 'SYSTEM'
        ),
        allowNull: false
    },
    target_resource: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    target_resource_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    changes: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Success', 'Failed'),
        defaultValue: 'Success'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['action_type'] },
        { fields: ['timestamp'] },
        { fields: ['user_id', 'timestamp'] },
        { fields: ['action_type', 'timestamp'] }
    ]
});

module.exports = AuditLog;
