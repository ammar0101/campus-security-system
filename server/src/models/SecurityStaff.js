const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SecurityStaff = sequelize.define('SecurityStaff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    badge_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    shift: {
        type: DataTypes.ENUM('Morning', 'Afternoon', 'Night', 'Rotating'),
        defaultValue: 'Rotating'
    },
    is_on_duty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    current_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    current_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    location_last_updated: {
        type: DataTypes.DATE,
        allowNull: true
    },
    assigned_zone: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'security_staff',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['badge_number'] },
        { fields: ['is_on_duty'] }
    ]
});

module.exports = SecurityStaff;
