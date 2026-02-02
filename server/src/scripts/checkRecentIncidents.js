const { Incident } = require('../models');
const { testConnection } = require('../config/database');

async function checkRecentIncidents() {
    try {
        await testConnection();

        console.log('\n📋 Recent Incidents (Last 5):\n');

        const incidents = await Incident.findAll({
            order: [['created_at', 'DESC']],
            limit: 5,
            attributes: ['incident_id', 'incident_type', 'location_id', 'map_location', 'created_at']
        });

        if (incidents.length === 0) {
            console.log('No incidents found.\n');
        } else {
            incidents.forEach((inc, idx) => {
                console.log(`${idx + 1}. Incident ID: ${inc.incident_id}`);
                console.log(`   Type: ${inc.incident_type}`);
                console.log(`   Location ID: ${inc.location_id || 'null'}`);
                console.log(`   Map Location: ${inc.map_location || 'Not specified'}`);
                console.log(`   Created: ${inc.created_at}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkRecentIncidents();
