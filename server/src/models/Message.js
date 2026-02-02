const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
    message_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    sender_user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    receiver_user_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 1000]
        }
    },
    time_stamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    message_type: {
        type: DataTypes.ENUM('Direct', 'Group', 'Broadcast'),
        defaultValue: 'Direct'
    },
    related_incident_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: 'incidents',
            key: 'incident_id'
        }
    },
    attachments: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    priority: {
        type: DataTypes.ENUM('Normal', 'High', 'Urgent'),
        defaultValue: 'Normal'
    },
    deleted_by: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    tableName: 'messages',
    indexes: [
        { fields: ['sender_user_id'] },
        { fields: ['receiver_user_id'] },
        { fields: ['time_stamp'] },
        { fields: ['is_read'] },
        { fields: ['receiver_user_id', 'is_read', 'time_stamp'] }
    ]
});

module.exports = Message;
