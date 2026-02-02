const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
    student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            is: /^STU\d{7}$/
        }
    },
    major: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    year_level: {
        type: DataTypes.ENUM('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate'),
        allowNull: false
    },
    enrollment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dormitory_building: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    dormitory_room: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    emergency_contacts: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    tableName: 'students',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['student_id'] }
    ]
});

module.exports = Student;
