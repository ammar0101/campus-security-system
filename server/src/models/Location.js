const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
    location_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    building: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    floor: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    room: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        validate: {
            min: -90,
            max: 90
        }
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        validate: {
            min: -180,
            max: 180
        }
    },
    map_location: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    zone: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        }
    },
    location_type: {
        type: DataTypes.ENUM(
            'Building', 'Parking', 'Open Area', 'Dormitory',
            'Laboratory', 'Library', 'Cafeteria', 'Sports Area', 'Other'
        ),
        defaultValue: 'Building'
    },
    is_accessible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    emergency_exits: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    landmarks: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    tableName: 'locations',
    indexes: [
        { fields: ['zone'] },
        { fields: ['location_type'] },
        { fields: ['latitude', 'longitude'] }
    ]
});

module.exports = Location;
