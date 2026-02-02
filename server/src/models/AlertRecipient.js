const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertRecipient = sequelize.define('AlertRecipient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    alert_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'alerts',
            key: 'alert_id'
        }
    },
    alert_receiver_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivery_status: {
        type: DataTypes.ENUM('Pending', 'Sent', 'Delivered', 'Failed', 'Read', 'Acknowledged'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    device_token: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'alert_recipients',
    indexes: [
        { fields: ['alert_id'] },
        { fields: ['alert_receiver_id'] },
        { fields: ['delivery_status'] },
        {
            fields: ['alert_id', 'alert_receiver_id'],
            unique: true
        }
    ]
});

module.exports = AlertRecipient;
