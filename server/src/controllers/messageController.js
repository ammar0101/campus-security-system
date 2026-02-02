const { Message, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { generateMessageId } = require('../utils/generateIds');
const { sendMessageNotification } = require('../services/notificationService');

const sendMessage = async (req, res, next) => {
    try {
        const { receiverUserID, content, priority = 'Normal', relatedIncidentID } = req.body;

        if (!receiverUserID || !content) {
            return errorResponse(res, 400, 'MISSING_FIELDS', 'Receiver and content are required');
        }

        const receiver = await User.findOne({ where: { user_id: receiverUserID } });
        if (!receiver) {
            return errorResponse(res, 404, 'RECEIVER_NOT_FOUND', 'Receiver not found');
        }

        const messageId = generateMessageId();
        const message = await Message.create({
            message_id: messageId,
            sender_user_id: req.user.userID,
            receiver_user_id: receiverUserID,
            content,
            priority,
            related_incident_id: relatedIncidentID || null
        });

        // Send push notification
        if (receiver.device_tokens?.length) {
            await sendMessageNotification(receiver.device_tokens[0], message, req.user);
        }

        // Emit socket event
        if (global.io) {
            global.io.to(receiverUserID).emit('message:received', {
                message: message.toJSON(),
                sender: {
                    userID: req.user.userID,
                    userName: req.user.userName,
                    role: req.user.role
                }
            });
        }

        return successResponse(res, 201, 'Message sent successfully', message.toJSON());
    } catch (error) {
        next(error);
    }
};

const listMessages = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, unreadOnly = false } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            [Op.or]: [
                { sender_user_id: req.user.userID },
                { receiver_user_id: req.user.userID }
            ]
        };

        if (unreadOnly) {
            where.receiver_user_id = req.user.userID;
            where.is_read = false;
        }

        const { count, rows } = await Message.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['time_stamp', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['user_id', 'user_name', 'role']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['user_id', 'user_name', 'role']
                }
            ]
        });

        // Map messages to include sender_name and time_sent for frontend
        const messages = rows.map(msg => ({
            message_id: msg.message_id,
            sender_user_id: msg.sender_user_id,
            receiver_user_id: msg.receiver_user_id,
            sender_name: msg.sender?.user_name || 'Unknown',
            receiver_name: msg.receiver?.user_name || 'Unknown',
            content: msg.content,
            priority: msg.priority,
            is_read: msg.is_read,
            time_sent: msg.time_stamp,
            related_incident_id: msg.related_incident_id
        }));

        const unreadCount = await Message.count({
            where: {
                receiver_user_id: req.user.userID,
                is_read: false
            }
        });

        return successResponse(res, 200, 'Messages retrieved successfully', {
            messages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)),
                totalCount: count
            },
            unreadCount
        });
    } catch (error) {
        console.error('List messages error:', error);
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { messageID } = req.params;

        const message = await Message.findOne({ where: { message_id: messageID } });

        if (!message) {
            return errorResponse(res, 404, 'MESSAGE_NOT_FOUND', 'Message not found');
        }

        if (message.receiver_user_id !== req.user.userID) {
            return errorResponse(res, 403, 'FORBIDDEN', 'You can only mark your own messages as read');
        }

        if (!message.is_read) {
            await message.update({
                is_read: true,
                read_at: new Date()
            });
        }

        return successResponse(res, 200, 'Message marked as read');
    } catch (error) {
        next(error);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const { messageID } = req.params;

        const message = await Message.findOne({ where: { message_id: messageID } });

        if (!message) {
            return errorResponse(res, 404, 'MESSAGE_NOT_FOUND', 'Message not found');
        }

        const deletedBy = message.deleted_by || [];
        if (!deletedBy.includes(req.user.userID)) {
            deletedBy.push(req.user.userID);
            await message.update({ deleted_by: deletedBy });
        }

        return successResponse(res, 200, 'Message deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    listMessages,
    markAsRead,
    deleteMessage
};
