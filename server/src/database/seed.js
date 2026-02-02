const { sequelize } = require('../config/database');
const {
    User,
    Admin,
    SecurityStaff,
    Student,
    Location,
    SystemSetting
} = require('../models');
const { generateUserId, generateLocationId, generateBadgeNumber } = require('../utils/generateIds');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Create admin user
        console.log('Creating admin user...');
        const adminUserId = generateUserId();
        const adminUser = await User.create({
            user_id: adminUserId,
            user_name: 'System Administrator',
            email: 'admin@campus.edu',
            password: 'Admin@123456', // Will be hashed
            phone_number: '+1234567890',
            role: 'Admin',
            status: 'Active',
            email_verified: true
        });

        await Admin.create({
            user_id: adminUserId,
            admin_level: 'Super Admin',
            department: 'Security Administration',
            permissions: ['all']
        });
        console.log('✅ Admin user created: admin@campus.edu / Admin@123456\n');

        // Create security staff
        console.log('Creating security staff...');
        const staffUserId = generateUserId();
        const staffUser = await User.create({
            user_id: staffUserId,
            user_name: 'John Security',
            email: 'security@campus.edu',
            password: 'Security@123',
            phone_number: '+1234567891',
            role: 'SecurityStaff',
            zone: 'North Campus',
            status: 'Active',
            email_verified: true
        });

        const badgeNumber = await generateBadgeNumber();
        await SecurityStaff.create({
            user_id: staffUserId,
            badge_number: badgeNumber,
            shift: 'Morning',
            is_on_duty: true,
            assigned_zone: 'North Campus'
        });
        console.log('✅ Security staff created: security@campus.edu / Security@123\n');

        // Create sample student
        console.log('Creating sample student...');
        const studentUserId = generateUserId();
        const studentUser = await User.create({
            user_id: studentUserId,
            user_name: 'Alice Student',
            email: 'student@campus.edu',
            password: 'Student@123',
            phone_number: '+1234567892',
            role: 'Student',
            zone: 'South Campus',
            status: 'Active',
            email_verified: true
        });

        await Student.create({
            user_id: studentUserId,
            student_id: 'STU0000001',
            major: 'Computer Science',
            year_level: 'Year 3',
            dormitory_building: 'Building A',
            dormitory_room: '301',
            emergency_contacts: [
                {
                    name: 'Parent Name',
                    relationship: 'Parent',
                    phone: '+1234567893',
                    email: 'parent@email.com'
                }
            ]
        });
        console.log('✅ Student created: student@campus.edu / Student@123\n');

        // Create MMU Cyberjaya campus locations
        console.log('Creating campus locations...');
        const locations = [
            {
                location_id: generateLocationId(),
                building: 'MMU Main Building',
                floor: 'Ground',
                latitude: 2.9267,
                longitude: 101.6574,
                zone: 'Central Campus',
                location_type: 'Administrative',
                capacity: 300,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Faculty of Engineering',
                floor: '1',
                latitude: 2.9270,
                longitude: 101.6580,
                zone: 'North Campus',
                location_type: 'Academic',
                capacity: 500,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Faculty of Computing & Informatics',
                floor: '2',
                latitude: 2.9265,
                longitude: 101.6570,
                zone: 'Central Campus',
                location_type: 'Academic',
                capacity: 400,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Multimedia University Library',
                floor: '1',
                latitude: 2.9268,
                longitude: 101.6576,
                zone: 'Central Campus',
                location_type: 'Library',
                capacity: 600,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Student Center & Cafeteria',
                floor: 'Ground',
                latitude: 2.9272,
                longitude: 101.6572,
                zone: 'Central Campus',
                location_type: 'Cafeteria',
                capacity: 400,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Sports Complex',
                floor: 'Ground',
                latitude: 2.9275,
                longitude: 101.6585,
                zone: 'East Campus',
                location_type: 'Sports Area',
                capacity: 1000,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Student Hostel Block A',
                floor: '3',
                latitude: 2.9260,
                longitude: 101.6565,
                zone: 'South Campus',
                location_type: 'Dormitory',
                capacity: 200,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Student Hostel Block B',
                floor: '4',
                latitude: 2.9258,
                longitude: 101.6568,
                zone: 'South Campus',
                location_type: 'Dormitory',
                capacity: 200,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Lecture Hall Complex',
                floor: '1',
                latitude: 2.9269,
                longitude: 101.6578,
                zone: 'North Campus',
                location_type: 'Lecture Hall',
                capacity: 800,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Research & Innovation Center',
                floor: '2',
                latitude: 2.9273,
                longitude: 101.6582,
                zone: 'North Campus',
                location_type: 'Laboratory',
                capacity: 150,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Parking Area A',
                latitude: 2.9262,
                longitude: 101.6560,
                zone: 'West Campus',
                location_type: 'Parking',
                capacity: 500,
                is_accessible: true
            },
            {
                location_id: generateLocationId(),
                building: 'Parking Area B',
                latitude: 2.9278,
                longitude: 101.6590,
                zone: 'East Campus',
                location_type: 'Parking',
                capacity: 300,
                is_accessible: true
            }
        ];

        await Location.bulkCreate(locations);
        console.log(`✅ Created ${locations.length} campus locations\n`);

        // Create system settings
        console.log('Creating system settings...');
        const settings = [
            {
                setting_key: 'alert_retention_days',
                setting_value: { value: 90 },
                category: 'Alerts',
                description: 'Number of days to retain alert history',
                data_type: 'Number',
                is_editable: true
            },
            {
                setting_key: 'session_timeout_minutes',
                setting_value: { value: 60 },
                category: 'Security',
                description: 'User session timeout in minutes',
                data_type: 'Number',
                is_editable: true
            },
            {
                setting_key: 'max_file_upload_size_mb',
                setting_value: { value: 10 },
                category: 'General',
                description: 'Maximum file upload size in megabytes',
                data_type: 'Number',
                is_editable: true
            },
            {
                setting_key: 'panic_countdown_seconds',
                setting_value: { value: 5 },
                category: 'Security',
                description: 'Emergency panic button countdown duration',
                data_type: 'Number',
                is_editable: true
            },
            {
                setting_key: 'enable_email_notifications',
                setting_value: { value: true },
                category: 'Notifications',
                description: 'Enable email notifications for critical alerts',
                data_type: 'Boolean',
                is_editable: true
            },
            {
                setting_key: 'enable_push_notifications',
                setting_value: { value: true },
                category: 'Notifications',
                description: 'Enable push notifications',
                data_type: 'Boolean',
                is_editable: true
            },
            {
                setting_key: 'incident_auto_close_days',
                setting_value: { value: 30 },
                category: 'Policies',
                description: 'Auto-close resolved incidents after N days',
                data_type: 'Number',
                is_editable: true
            }
        ];

        await SystemSetting.bulkCreate(settings);
        console.log(`✅ Created ${settings.length} system settings\n`);

        console.log('🎉 Database seeding completed successfully!\n');
        console.log('📝 Test Credentials:');
        console.log('   Admin: admin@campus.edu / Admin@123456');
        console.log('   Security: security@campus.edu / Security@123');
        console.log('   Student: student@campus.edu / Student@123\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

// Run seeding if called directly
if (require.main === module) {
    const { testConnection } = require('../config/database');

    (async () => {
        try {
            await testConnection();
            await sequelize.sync({ force: false }); // Don't drop tables
            await seedDatabase();
            process.exit(0);
        } catch (error) {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        }
    })();
}

module.exports = { seedDatabase };
