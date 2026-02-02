const { User, Admin, SecurityStaff, Student, Visitor } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { processUploadedFiles } = require('../services/uploadService');
const { sendApprovalEmail } = require('../services/emailService');
const { Op } = require('sequelize');

/**
 * List all users (Admin only)
 */
const listUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            status,
            search,
            zone,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};

        if (role) where.role = role;
        if (status) where.status = status;
        if (zone) where.zone = zone;

        if (search) {
            where[Op.or] = [
                { user_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { user_id: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] },
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder.toUpperCase()]]
        });

        // Get role-specific data for each user
        const usersWithRoleData = await Promise.all(users.map(async (user) => {
            const userData = user.toJSON();

            if (user.role === 'Student') {
                const student = await Student.findOne({ where: { user_id: user.user_id } });
                userData.roleDetails = student?.toJSON();
            } else if (user.role === 'SecurityStaff') {
                const staff = await SecurityStaff.findOne({ where: { user_id: user.user_id } });
                userData.roleDetails = staff?.toJSON();
            } else if (user.role === 'Visitor') {
                const visitor = await Visitor.findOne({ where: { user_id: user.user_id } });
                userData.roleDetails = visitor?.toJSON();
            } else if (user.role === 'Admin') {
                const admin = await Admin.findOne({ where: { user_id: user.user_id } });
                userData.roleDetails = admin?.toJSON();
            }

            return userData;
        }));

        return successResponse(res, 200, 'Users retrieved successfully', {
            users: usersWithRoleData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)),
                totalCount: count,
                limit: parseInt(limit),
                hasNextPage: offset + users.length < count,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single user details
 */
const getUser = async (req, res, next) => {
    try {
        const { userID } = req.params;

        // Check permissions
        if (req.user.role !== 'Admin' && req.user.userID !== userID) {
            return errorResponse(res, 403, 'FORBIDDEN', 'You can only view your own profile');
        }

        const user = await User.findOne({
            where: { user_id: userID },
            attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
        });

        if (!user) {
            return errorResponse(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        // Get role-specific data
        let roleDetails = null;
        if (user.role === 'Student') {
            roleDetails = await Student.findOne({ where: { user_id: userID } });
        } else if (user.role === 'SecurityStaff') {
            roleDetails = await SecurityStaff.findOne({ where: { user_id: userID } });
        } else if (user.role === 'Visitor') {
            roleDetails = await Visitor.findOne({ where: { user_id: userID } });
        } else if (user.role === 'Admin') {
            roleDetails = await Admin.findOne({ where: { user_id: userID } });
        }

        return successResponse(res, 200, 'User retrieved successfully', {
            ...user.toJSON(),
            roleDetails: roleDetails?.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
const updateUser = async (req, res, next) => {
    try {
        const { userID } = req.params;
        const updates = req.body;

        // Check permissions
        const isOwnProfile = req.user.userID === userID;
        const isAdmin = req.user.role === 'Admin';

        if (!isOwnProfile && !isAdmin) {
            return errorResponse(res, 403, 'FORBIDDEN', 'You can only update your own profile');
        }

        const user = await User.findOne({ where: { user_id: userID } });

        if (!user) {
            return errorResponse(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        // Non-admin can only update certain fields
        const allowedFields = isAdmin
            ? ['user_name', 'phone_number', 'zone', 'profile_image']
            : ['user_name', 'phone_number', 'profile_image'];

        const userUpdates = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                userUpdates[field] = updates[field];
            }
        });

        // Handle profile image upload
        if (req.file) {
            const [imageUrl] = await processUploadedFiles([req.file]);
            userUpdates.profile_image = imageUrl;
        }

        await user.update(userUpdates);

        return successResponse(res, 200, 'User profile updated successfully', {
            userID: user.user_id,
            userName: user.user_name,
            updatedAt: user.updated_at
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change user status (Admin only)
 */
const changeStatus = async (req, res, next) => {
    try {
        const { userID } = req.params;
        const { status, reason } = req.body;

        if (!status) {
            return errorResponse(res, 400, 'STATUS_REQUIRED', 'Status is required');
        }

        // Prevent admin from changing their own status
        if (req.user.userID === userID) {
            return errorResponse(res, 400, 'CANNOT_CHANGE_OWN_STATUS', 'You cannot change your own status');
        }

        const user = await User.findOne({ where: { user_id: userID } });

        if (!user) {
            return errorResponse(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        const previousStatus = user.status;

        await user.update({ status });

        // Send approval email if status changed to Active
        if (status === 'Active' && previousStatus === 'Pending') {
            await sendApprovalEmail(user);
        }

        // Emit socket event
        if (global.io) {
            global.io.to('admins').emit('user:status-changed', {
                userID: user.user_id,
                previousStatus,
                newStatus: status
            });
        }

        return successResponse(res, 200, `User status updated to ${status}`, {
            userID: user.user_id,
            previousStatus,
            newStatus: status
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (soft delete)
 */
const deleteUser = async (req, res, next) => {
    try {
        const { userID } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.userID === userID) {
            return errorResponse(res, 400, 'CANNOT_DELETE_SELF', 'You cannot delete your own account');
        }

        const user = await User.findOne({ where: { user_id: userID } });

        if (!user) {
            return errorResponse(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        await user.update({ status: 'Deleted' });

        return successResponse(res, 200, 'User account has been deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listUsers,
    getUser,
    updateUser,
    changeStatus,
    deleteUser
};
