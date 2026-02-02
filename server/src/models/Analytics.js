const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define('Analytics', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date_range_start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_range_end: {
        type: DataTypes.DATE,
        allowNull: false
    },
    period: {
        type: DataTypes.ENUM('Daily', 'Weekly', 'Monthly'),
        allowNull: false
    },
    metrics: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
            totalIncidents: 0,
            incidentsByType: [],
            incidentsByStatus: [],
            incidentsByZone: [],
            incidentsByPriority: [],
            averageResponseTime: 0,
            medianResponseTime: 0,
            totalAlerts: 0,
            alertsByType: [],
            alertsBySeverity: [],
            activeUsers: 0,
            newRegistrations: 0,
            resolvedIncidents: 0,
            criticalIncidents: 0,
            totalMessages: 0,
            topIncidentLocations: [],
            staffPerformance: []
        }
    },
    generated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'analytics',
    indexes: [
        { fields: ['period'] },
        { fields: ['date_range_start'] },
        { fields: ['period', 'date_range_start'] }
    ]
});

module.exports = Analytics;
