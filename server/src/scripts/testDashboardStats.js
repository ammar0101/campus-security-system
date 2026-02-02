const { Incident, User, SecurityStaff } = require('../models');
const { testConnection } = require('../config/database');
const { Op } = require('sequelize');

async function testDashboardStats() {
    try {
        await testConnection();

        console.log('🧪 Testing Dashboard Statistics...\n');

        // Total incidents
        const totalIncidents = await Incident.count();
        console.log(`📊 Total Incidents in DB: ${totalIncidents}`);

        // List all incidents by status
        const incidentsByStatus = await Incident.findAll({
            attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('incident_id')), 'count']],
            group: ['status'],
            raw: true
        });

        console.log('\n📋 Incidents by Status:');
        incidentsByStatus.forEach(item => {
            console.log(`   ${item.status}: ${item.count}`);
        });

        // Active incidents (New + In Progress + Escalated)
        const activeIncidents = await Incident.count({
            where: {
                status: {
                    [Op.notIn]: ['Resolved', 'Closed', 'Cancelled']
                }
            }
        });
        console.log(`\n✅ Active Incidents (not resolved/closed/cancelled): ${activeIncidents}`);

        // Total users
        const totalUsers = await User.count();
        console.log(`\n📊 Total Users: ${totalUsers}`);

        // Active users
        const activeUsers = await User.count({ where: { status: 'Active' } });
        console.log(`📊 Active Users: ${activeUsers}`);

        // On-duty staff
        const onDutyStaff = await SecurityStaff.count({ where: { is_on_duty: true } });
        console.log(`📊 On-Duty Staff: ${onDutyStaff}`);

        console.log('\n✅ These are the actual values from the database.');
        console.log('   If "Active Incidents" shows 1, that means there is only 1 incident not yet resolved.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testDashboardStats();
