const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    setting_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    setting_value: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Notifications', 'Alerts', 'Privacy', 'Policies', 'Security', 'General'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data_type: {
        type: DataTypes.ENUM('String', 'Number', 'Boolean', 'Object', 'Array'),
        allowNull: false
    },
    is_editable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_modified_by: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    last_modified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    validation_rules: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'system_settings',
    indexes: [
        { fields: ['setting_key'] },
        { fields: ['category'] }
    ]
});

module.exports = SystemSetting;
