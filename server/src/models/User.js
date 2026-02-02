const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    user_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [8, 255]
        }
    },
    role: {
        type: DataTypes.ENUM('Admin', 'SecurityStaff', 'Student', 'Visitor'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Active', 'Suspended', 'Pending', 'Expired', 'Deleted'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    zone: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    profile_image: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    device_tokens: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: []
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    indexes: [
        { fields: ['email'] },
        { fields: ['role'] },
        { fields: ['status'] },
        { fields: ['email', 'role'] }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
User.prototype.createPasswordResetToken = function () {
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    this.password_reset_token = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.password_reset_expires = Date.now() + 3600000; // 1 hour
    return resetToken;
};

module.exports = User;
