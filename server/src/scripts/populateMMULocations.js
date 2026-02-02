const { Location } = require('../models');
const { testConnection, sequelize } = require('../config/database');
const crypto = require('crypto');

// Generate unique Location ID
const generateLocationId = () => {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `LOC_${timestamp}_${randomStr}`;
};

// Real MMU Cyberjaya locations
const mmuLocations = [
    // Academic Buildings
    { building: 'Faculty of Management (FOM)', floor: 'Ground Floor', room: null, zone: 'North Campus', latitude: 2.9267, longitude: 101.6574 },
    { building: 'Faculty of Management (FOM)', floor: 'Level 1', room: null, zone: 'North Campus', latitude: 2.9267, longitude: 101.6574 },
    { building: 'Faculty of Engineering (FOE)', floor: 'Ground Floor', room: null, zone: 'South Campus', latitude: 2.9270, longitude: 101.6580 },
    { building: 'Faculty of Engineering (FOE)', floor: 'Level 1', room: null, zone: 'South Campus', latitude: 2.9270, longitude: 101.6580 },
    { building: 'Faculty of Computing and Informatics (FCI)', floor: 'Ground Floor', room: null, zone: 'East Campus', latitude: 2.9265, longitude: 101.6585 },
    { building: 'Faculty of Computing and Informatics (FCI)', floor: 'Level 1', room: null, zone: 'East Campus', latitude: 2.9265, longitude: 101.6585 },

    // Library
    { building: 'MMU Library', floor: 'Ground Floor', room: null, zone: 'Central Campus', latitude: 2.9268, longitude: 101.6577 },
    { building: 'MMU Library', floor: 'Level 1', room: null, zone: 'Central Campus', latitude: 2.9268, longitude: 101.6577 },
    { building: 'MMU Library', floor: 'Level 2', room: null, zone: 'Central Campus', latitude: 2.9268, longitude: 101.6577 },

    // Student Facilities
    { building: 'Student Hub', floor: 'Ground Floor', room: null, zone: 'Central Campus', latitude: 2.9266, longitude: 101.6576 },
    { building: 'Student Hub', floor: 'Level 1', room: null, zone: 'Central Campus', latitude: 2.9266, longitude: 101.6576 },
    { building: 'Cafeteria Block', floor: 'Ground Floor', room: null, zone: 'Central Campus', latitude: 2.9269, longitude: 101.6575 },

    // Sports & Recreation
    { building: 'Sports Complex', floor: 'Ground Floor', room: 'Main Hall', zone: 'West Campus', latitude: 2.9272, longitude: 101.6570 },
    { building: 'Sports Complex', floor: 'Ground Floor', room: 'Gymnasium', zone: 'West Campus', latitude: 2.9272, longitude: 101.6570 },
    { building: 'Swimming Pool Area', floor: null, room: null, zone: 'West Campus', latitude: 2.9273, longitude: 101.6568 },

    // Residential Halls
    { building: 'Mahallah Uthman', floor: 'Ground Floor', room: null, zone: 'Residential Area', latitude: 2.9260, longitude: 101.6590 },
    { building: 'Mahallah Ali', floor: 'Ground Floor', room: null, zone: 'Residential Area', latitude: 2.9258, longitude: 101.6592 },
    { building: 'Mahallah Fatimah', floor: 'Ground Floor', room: null, zone: 'Residential Area', latitude: 2.9256, longitude: 101.6595 },

    // Administration
    { building: 'Administration Building', floor: 'Ground Floor', room: null, zone: 'Central Campus', latitude: 2.9268, longitude: 101.6578 },
    { building: 'Administration Building', floor: 'Level 1', room: 'Registrar Office', zone: 'Central Campus', latitude: 2.9268, longitude: 101.6578 },

    // Parking & Common Areas
    { building: 'Parking Lot A', floor: null, room: null, zone: 'North Campus', latitude: 2.9275, longitude: 101.6572 },
    { building: 'Parking Lot B', floor: null, room: null, zone: 'South Campus', latitude: 2.9262, longitude: 101.6582 },
    { building: 'Main Entrance Gate', floor: null, room: null, zone: 'Entrance', latitude: 2.9280, longitude: 101.6575 },
    { building: 'Bus Stop Area', floor: null, room: null, zone: 'Entrance', latitude: 2.9278, longitude: 101.6574 },
];

const populateMMULocations = async () => {
    try {
        await testConnection();

        console.log('\n🗺️  Adding MMU Cyberjaya Locations...\n');

        // Don't clear existing locations - just add new ones
        console.log('ℹ️  Adding new locations (keeping existing ones)\n');

        let count = 0;
        for (const loc of mmuLocations) {
            const locationId = generateLocationId();
            await Location.create({
                location_id: locationId,
                building: loc.building,
                floor: loc.floor,
                room: loc.room,
                zone: loc.zone,
                latitude: loc.latitude,
                longitude: loc.longitude
            });
            count++;

            const locationName = `${loc.building}${loc.floor ? ` - ${loc.floor}` : ''}${loc.room ? ` - ${loc.room}` : ''} (${loc.zone})`;
            console.log(`✅ ${count}. ${locationName}`);
        }

        console.log(`\n🎉 Successfully populated ${count} MMU Cyberjaya locations!\n`);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error populating locations:', error.message);
        console.error(error);
        process.exit(1);
    }
};

populateMMULocations();
