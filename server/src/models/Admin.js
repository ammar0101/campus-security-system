const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
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
    admin_level: {
        type: DataTypes.ENUM('Super Admin', 'Manager', 'Supervisor'),
        defaultValue: 'Manager'
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    tableName: 'admins',
    indexes: [
        { fields: ['user_id'] }
    ]
});

module.exports = Admin;
