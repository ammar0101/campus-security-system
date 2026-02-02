const { Incident, User } = require('../models');
const { testConnection, sequelize } = require('../config/database');
const crypto = require('crypto');

const generateIncidentId = () => {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `INC_${timestamp}_${randomStr}`;
};

async function createTestIncident() {
    try {
        await testConnection();

        console.log('🧪 Creating TEST incident with location description...\n');

        // Get first student user
        const student = await User.findOne({ where: { role: 'Student' } });

        if (!student) {
            console.log('❌ No student user found. Please create a student account first.\n');
            process.exit(1);
        }

        console.log(`Using student: ${student.user_name} (${student.email})\n`);

        // Create incident with location description
        const incidentId = generateIncidentId();
        const incident = await Incident.create({
            incident_id: incidentId,
            incident_sender_id: student.user_id,
            sender_name: student.user_name,
            sender_role: student.role,
            sender_email: student.email,
            sender_phone: student.phone_number,
            location_id: null,
            map_location: 'TEST LOCATION - FCI 2nd Floor (PROOF IT WORKS!)', // ✅ This is the fix!
            incident_type: 'Other',
            description: 'This is a TEST incident to verify location descriptions are working correctly.',
            status: 'New',
            priority: 'Low',
            latitude: 2.9265,
            longitude: 101.6585,
            is_anonymous: false,
            status_history: [{
                status: 'New',
                timestamp: new Date(),
                updatedBy: 'System'
            }]
        });

        console.log('✅ TEST incident created successfully!\n');
        console.log('📋 Incident Details:');
        console.log(`   ID: ${incident.incident_id}`);
        console.log(`   Type: ${incident.incident_type}`);
        console.log(`   location_id: ${incident.location_id} (null is correct)`);
        console.log(`   map_location: ${incident.map_location}`);
        console.log(`   Created: ${incident.created_at}`);
        console.log('');
        console.log('🎯 NOW GO VIEW THIS INCIDENT IN THE BROWSER:');
        console.log(`   http://localhost:5173/incidents/${incident.incident_id}`);
        console.log('');
        console.log('✅ The location should show: "${incident.map_location}"\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await sequelize.close();
        process.exit(1);
    }
}

createTestIncident();
