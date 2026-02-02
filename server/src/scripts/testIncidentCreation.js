const { Incident } = require('../models');
const { testConnection, sequelize } = require('../config/database');

async function testIncidentCreation() {
    try {
        await testConnection();

        console.log('🧪 Testing incident creation flow...\n');

        // Check if map_location column exists
        const [tableInfo] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'incidents'
            AND column_name IN ('location_id', 'map_location')
            ORDER BY column_name;
        `);

        console.log('📋 Column Info:');
        tableInfo.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type}, nullable: ${col.is_nullable}`);
        });
        console.log('');

        // Check most recent incident
        const recent = await Incident.findOne({
            order: [['created_at', 'DESC']],
            attributes: ['incident_id', 'incident_type', 'location_id', 'map_location', 'created_at']
        });

        if (recent) {
            console.log('📋 Most Recent Incident:');
            console.log(`   ID: ${recent.incident_id}`);
            console.log(`   Type: ${recent.incident_type}`);
            console.log(`   location_id: ${recent.location_id}`);
            console.log(`   map_location: ${recent.map_location}`);
            console.log(`   Created: ${recent.created_at}`);
            console.log('');

            if (!recent.map_location) {
                console.log('⚠️  This incident has NO map_location value!');
                console.log('   This is likely an OLD incident created before the fix.\n');
                console.log('💡 Create a NEW incident to test the fix!\n');
            } else {
                console.log('✅ map_location is set correctly!\n');
            }
        } else {
            console.log('ℹ️  No incidents found in database.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testIncidentCreation();
