const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Student, Visitor, Admin, SecurityStaff } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { generateUserId, generateVisitorPassNumber, generateBadgeNumber } = require('../utils/generateIds');
const { sendRegistrationEmail, sendPasswordResetEmail, sendApprovalEmail } = require('../services/emailService');
const { blacklistToken } = require('../middleware/auth');

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        {
            userID: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
        {
            userID: user.user_id,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
};

/**
 * Register a new user (Student or Visitor only)
 */
const register = async (req, res, next) => {
    try {
        const {
            userName,
            email,
            password,
            phoneNumber,
            role,
            zone,
            // Student fields
            studentID,
            major,
            yearLevel,
            dormitoryInfo,
            emergencyContacts,
            // Visitor fields
            purposeOfVisit,
            visitStart,
            visitEnd,
            hostContact
        } = req.body;

        // Validate role (only Student and Visitor can self-register)
        if (!['Student', 'Visitor'].includes(role)) {
            return errorResponse(res, 400, 'INVALID_ROLE', 'Only Student and Visitor roles can self-register');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return errorResponse(res, 409, 'EMAIL_EXISTS', 'A user with this email already exists');
        }

        // Check if phone number already exists
        const existingPhone = await User.findOne({ where: { phone_number: phoneNumber } });
        if (existingPhone) {
            return errorResponse(res, 409, 'PHONE_EXISTS', 'A user with this phone number already exists');
        }

        // Create user
        const userId = generateUserId();
        const user = await User.create({
            user_id: userId,
            user_name: userName,
            email,
            password, // Will be hashed by beforeCreate hook
            phone_number: phoneNumber,
            role,
            zone: zone || null,
            status: 'Pending' // Requires admin approval
        });

        // Create role-specific profile
        if (role === 'Student') {
            // Validate student-specific fields
            if (!studentID || !major || !yearLevel) {
                await user.destroy();
                return errorResponse(res, 400, 'MISSING_FIELDS', 'Student ID, major, and year level are required for students');
            }

            // Check if student ID already exists
            const existingStudent = await Student.findOne({ where: { student_id: studentID } });
            if (existingStudent) {
                await user.destroy();
                return errorResponse(res, 409, 'STUDENT_ID_EXISTS', 'This student ID is already registered');
            }

            await Student.create({
                user_id: userId,
                student_id: studentID,
                major,
                year_level: yearLevel,
                dormitory_building: dormitoryInfo?.building || null,
                dormitory_room: dormitoryInfo?.room || null,
                emergency_contacts: emergencyContacts || []
            });
        } else if (role === 'Visitor') {
            // Validate visitor-specific fields
            if (!purposeOfVisit || !visitStart || !visitEnd) {
                await user.destroy();
                return errorResponse(res, 400, 'MISSING_FIELDS', 'Purpose of visit, visit start, and visit end are required for visitors');
            }

            // Validate visit dates
            const startDate = new Date(visitStart);
            const endDate = new Date(visitEnd);
            const now = new Date();

            if (startDate < now) {
                await user.destroy();
                return errorResponse(res, 400, 'INVALID_DATE', 'Visit start date must be today or in the future');
            }

            if (endDate <= startDate) {
                await user.destroy();
                return errorResponse(res, 400, 'INVALID_DATE', 'Visit end date must be after visit start date');
            }

            const passNumber = generateVisitorPassNumber();

            await Visitor.create({
                user_id: userId,
                purpose_of_visit: purposeOfVisit,
                visit_start: visitStart,
                visit_end: visitEnd,
                host_name: hostContact?.name || null,
                host_phone: hostContact?.phone || null,
                host_department: hostContact?.department || null,
                pass_number: passNumber
            });
        }

        // Send registration confirmation email
        await sendRegistrationEmail(user);

        return successResponse(res, 201, 'Registration successful. Your account is pending approval.', {
            userID: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return errorResponse(res, 400, 'MISSING_CREDENTIALS', 'Email and password are required');
        }

        // Find user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // Check account status
        if (user.status === 'Pending') {
            return errorResponse(res, 401, 'ACCOUNT_PENDING', 'Your account is pending approval');
        }

        if (user.status === 'Suspended') {
            return errorResponse(res, 401, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
        }

        if (user.status === 'Expired') {
            return errorResponse(res, 401, 'ACCOUNT_EXPIRED', 'Your visitor pass has expired');
        }

        if (user.status === 'Deleted') {
            return errorResponse(res, 401, 'ACCOUNT_DELETED', 'This account has been deleted');
        }

        // Update last login
        await user.update({ last_login: new Date() });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        return successResponse(res, 200, 'Login successful', {
            token: accessToken,
            refreshToken,
            user: {
                userID: user.user_id,
                userName: user.user_name,
                email: user.email,
                role: user.role,
                status: user.status,
                zone: user.zone,
                profileImage: user.profile_image,
                lastLogin: user.last_login
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout
 */
const logout = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (token) {
            blacklistToken(token);
        }

        return successResponse(res, 200, 'Logout successful');
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return errorResponse(res, 400, 'TOKEN_REQUIRED', 'Refresh token is required');
        }

        // Verify refresh token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return errorResponse(res, 401, 'INVALID_TOKEN', 'Invalid refresh token');
        }

        // Find user
        const user = await User.findOne({ where: { user_id: decoded.userID } });

        if (!user || user.status !== 'Active') {
            return errorResponse(res, 401, 'INVALID_TOKEN', 'User not found or inactive');
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        return successResponse(res, 200, 'Token refreshed successfully', tokens);
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return errorResponse(res, 401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
        }
        next(error);
    }
};

/**
 * Forgot password - send reset email
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorResponse(res, 400, 'EMAIL_REQUIRED', 'Email is required');
        }

        const user = await User.findOne({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            return successResponse(res, 200, 'If an account with this email exists, you will receive a password reset link shortly.');
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save();

        // Send reset email
        await sendPasswordResetEmail(user, resetToken);

        return successResponse(res, 200, 'If an account with this email exists, you will receive a password reset link shortly.');
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return errorResponse(res, 400, 'PASSWORD_REQUIRED', 'New password is required');
        }

        if (password.length < 8) {
            return errorResponse(res, 400, 'PASSWORD_TOO_SHORT', 'Password must be at least 8 characters');
        }

        // Hash the token from URL
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            where: {
                password_reset_token: hashedToken,
                password_reset_expires: {
                    [require('sequelize').Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            return errorResponse(res, 400, 'INVALID_TOKEN', 'Password reset token is invalid or has expired');
        }

        // Update password
        user.password = password; // Will be hashed by beforeUpdate hook
        user.password_reset_token = null;
        user.password_reset_expires = null;
        await user.save();

        return successResponse(res, 200, 'Password has been reset successfully. You can now log in with your new password.');
    } catch (error) {
        next(error);
    }
};

/**
 * Create staff account (Admin only - for SecurityStaff and Admin roles)
 */
const createStaffAccount = async (req, res, next) => {
    try {
        const {
            userName,
            email,
            password,
            phoneNumber,
            role,
            zone
        } = req.body;

        // Validate role (only Admin and SecurityStaff can be created by admins)
        if (!['Admin', 'SecurityStaff'].includes(role)) {
            return errorResponse(res, 400, 'INVALID_ROLE', 'Only Admin and SecurityStaff roles can be created through this endpoint');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return errorResponse(res, 409, 'EMAIL_EXISTS', 'A user with this email already exists');
        }

        // Check if phone number already exists
        const existingPhone = await User.findOne({ where: { phone_number: phoneNumber } });
        if (existingPhone) {
            return errorResponse(res, 409, 'PHONE_EXISTS', 'A user with this phone number already exists');
        }

        // Create user
        const userId = generateUserId();
        const user = await User.create({
            user_id: userId,
            user_name: userName,
            email,
            password, // Will be hashed by beforeCreate hook
            phone_number: phoneNumber,
            role,
            zone: zone || null,
            status: 'Active' // Staff accounts are active immediately
        });

        // Create role-specific profile
        if (role === 'Admin') {
            await Admin.create({
                user_id: userId,
                department: 'Security Department',
                permissions: ['ALL']
            });
        } else if (role === 'SecurityStaff') {
            const badgeNumber = generateBadgeNumber();
            await SecurityStaff.create({
                user_id: userId,
                badge_number: badgeNumber,
                shift: 'Day Shift',
                is_on_duty: false,
                assigned_zone: zone || 'General'
            });
        }

        return successResponse(res, 201, `${role} account created successfully`, {
            userID: user.user_id,
            email: user.email,
            role: user.role,
            status: user.status
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    createStaffAccount
};
