const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertLocation = sequelize.define('AlertLocation', {
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
    location_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'locations',
            key: 'location_id'
        }
    },
    affected_area: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    evacuation_route: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    safe_zone: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'alert_locations',
    indexes: [
        { fields: ['alert_id'] },
        { fields: ['location_id'] },
        {
            fields: ['alert_id', 'location_id'],
            unique: true
        }
    ]
});

module.exports = AlertLocation;
