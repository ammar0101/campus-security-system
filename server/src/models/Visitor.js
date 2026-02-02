const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitor = sequelize.define('Visitor', {
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
    purpose_of_visit: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 500]
        }
    },
    visit_start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    visit_end: {
        type: DataTypes.DATE,
        allowNull: false
    },
    host_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    host_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    host_department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    check_in_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    check_out_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pass_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: true
    }
}, {
    tableName: 'visitors',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['pass_number'] },
        { fields: ['visit_end'] }
    ]
});

module.exports = Visitor;
