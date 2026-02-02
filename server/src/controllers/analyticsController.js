const { Incident, Alert, User, SecurityStaff } = require('../models');
const { successResponse } = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const getDashboardStats = async (req, res, next) => {
    try {
        const { dateFrom, dateTo, zone } = req.query;

        const dateFilter = {};
        if (dateFrom) dateFilter[Op.gte] = new Date(dateFrom);
        if (dateTo) dateFilter[Op.lte] = new Date(dateTo);

        const whereClause = dateFrom || dateTo ? { date_time: dateFilter } : {};

        // Separate queries for each grouping to avoid duplicates
        const incidentsByStatus = await Incident.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('incident_id')), 'count']
            ],
            where: whereClause,
            group: ['status'],
            raw: true
        });

        const incidentsByType = await Incident.findAll({
            attributes: [
                'incident_type',
                [sequelize.fn('COUNT', sequelize.col('incident_id')), 'count']
            ],
            where: whereClause,
            group: ['incident_type'],
            raw: true
        });

        const incidentsByPriority = await Incident.findAll({
            attributes: [
                'priority',
                [sequelize.fn('COUNT', sequelize.col('incident_id')), 'count']
            ],
            where: whereClause,
            group: ['priority'],
            raw: true
        });

        const totalIncidents = await Incident.count({
            where: whereClause
        });

        const criticalIncidents = await Incident.count({
            where: {
                priority: 'Critical',
                status: { [Op.notIn]: ['Resolved', 'Closed'] },
                ...whereClause
            }
        });

        // Average response time
        const avgResponseTime = await Incident.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('response_time')), 'avg']],
            where: {
                response_time: { [Op.not]: null },
                ...whereClause
            },
            raw: true
        });

        // Alert stats
        const totalAlerts = await Alert.count({
            where: dateFrom || dateTo ? { time_sent: dateFilter } : {}
        });

        const activeAlerts = await Alert.count({
            where: {
                status: { [Op.in]: ['Broadcasting', 'Delivered'] },
                expires_at: { [Op.gt]: new Date() }
            }
        });

        // User stats
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'Active' } });
        const onDutyStaff = await SecurityStaff.count({ where: { is_on_duty: true } });

        // Resolved incidents count
        const resolvedIncidents = await Incident.count({
            where: {
                status: 'Resolved',
                ...whereClause
            }
        });

        // Active incidents count (New + In Progress only)
        const activeIncidents = await Incident.count({
            where: {
                status: { [Op.in]: ['New', 'In Progress'] },
                ...whereClause
            }
        });

        const resolutionRate = totalIncidents > 0
            ? ((resolvedIncidents / totalIncidents) * 100).toFixed(0)
            : 0;

        return successResponse(res, 200, 'Dashboard statistics retrieved successfully', {
            incidents: {
                total: totalIncidents,
                active: activeIncidents,
                critical: criticalIncidents,
                resolved: resolvedIncidents,
                resolutionRate: parseInt(resolutionRate),
                byStatus: incidentsByStatus,
                byType: incidentsByType,
                byPriority: incidentsByPriority,
                avgResponseTime: parseFloat(avgResponseTime?.avg || 0).toFixed(2)
            },
            alerts: {
                total: totalAlerts,
                active: activeAlerts
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                onDutyStaff
            }
        });
    } catch (error) {
        next(error);
    }
};

const getIncidentAnalytics = async (req, res, next) => {
    try {
        const { period = 'weekly', zone } = req.query;

        const dateRanges = {
            daily: 1,
            weekly: 7,
            monthly: 30
        };

        const days = dateRanges[period] || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const incidents = await Incident.findAll({
            where: {
                date_time: { [Op.gte]: startDate }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date_time')), 'date'],
                'incident_type',
                'priority',
                [sequelize.fn('COUNT', sequelize.col('incident_id')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('date_time')), 'incident_type', 'priority'],
            raw: true
        });

        return successResponse(res, 200, 'Incident analytics retrieved successfully', {
            period,
            dateRange: { from: startDate, to: new Date() },
            data: incidents
        });
    } catch (error) {
        next(error);
    }
};

const exportAnalytics = async (req, res, next) => {
    try {
        const { format = 'json', dateFrom, dateTo } = req.query;

        const where = {};
        if (dateFrom) where.date_time = { [Op.gte]: new Date(dateFrom) };
        if (dateTo) where.date_time = { ...where.date_time, [Op.lte]: new Date(dateTo) };

        const incidents = await Incident.findAll({ where, raw: true });
        const alerts = await Alert.findAll({ where: dateFrom || dateTo ? { time_sent: where.date_time } : {}, raw: true });

        const data = {
            exportDate: new Date(),
            dateRange: { from: dateFrom, to: dateTo },
            incidents,
            alerts,
            summary: {
                totalIncidents: incidents.length,
                totalAlerts: alerts.length
            }
        };

        if (format === 'json') {
            return res.json(data);
        }

        // For CSV, you would implement CSV conversion here
        return successResponse(res, 200, 'Analytics exported successfully', data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getIncidentAnalytics,
    exportAnalytics
};
