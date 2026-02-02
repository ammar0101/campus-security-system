const { SystemSetting } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const getAllSettings = async (req, res, next) => {
    try {
        const { category } = req.query;
        const where = category ? { category } : {};

        const settings = await SystemSetting.findAll({ where });

        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting.toJSON());
            return acc;
        }, {});

        return successResponse(res, 200, 'Settings retrieved successfully', grouped);
    } catch (error) {
        next(error);
    }
};

const getSetting = async (req, res, next) => {
    try {
        const { settingKey } = req.params;

        const setting = await SystemSetting.findOne({ where: { setting_key: settingKey } });

        if (!setting) {
            return errorResponse(res, 404, 'SETTING_NOT_FOUND', 'Setting not found');
        }

        return successResponse(res, 200, 'Setting retrieved successfully', setting.toJSON());
    } catch (error) {
        next(error);
    }
};

const updateSetting = async (req, res, next) => {
    try {
        const { settingKey } = req.params;
        const { value } = req.body;

        const setting = await SystemSetting.findOne({ where: { setting_key: settingKey } });

        if (!setting) {
            return errorResponse(res, 404, 'SETTING_NOT_FOUND', 'Setting not found');
        }

        if (!setting.is_editable) {
            return errorResponse(res, 400, 'SETTING_NOT_EDITABLE', 'This setting cannot be modified');
        }

        await setting.update({
            setting_value: value,
            last_modified_by: req.user.userID,
            last_modified_at: new Date()
        });

        return successResponse(res, 200, 'Setting updated successfully', setting.toJSON());
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSettings,
    getSetting,
    updateSetting
};
