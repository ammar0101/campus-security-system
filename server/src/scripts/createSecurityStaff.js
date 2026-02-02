const { User, SecurityStaff } = require('../models');
const { testConnection, sequelize } = require('../config/database');
const crypto = require('crypto');

// Generate unique User ID
const generateUserId = () => {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `USER_${timestamp}_${randomStr}`;
};

// Generate unique Badge Number
const generateBadgeNumber = () => {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `BADGE_${timestamp}_${randomStr}`;
};

const createSecurityStaff = async () => {
    try {
        // Test database connection
        await testConnection();

        // Staff details
        const staffData = {
            userName: 'John Security',
            email: 'john.security@mmu.edu.my',
            password: 'TestPass123!',
            phoneNumber: '+60123456789',
            zone: 'North Campus'
        };

        console.log('\n🔄 Creating Security Staff Account...');
        console.log('Email:', staffData.email);
        console.log('Password:', staffData.password);

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: staffData.email } });
        if (existingUser) {
            console.log('\n⚠️  User with this email already exists!');
            console.log('Email:', staffData.email);
            console.log('\nYou can login with:');
            console.log('Email:', staffData.email);
            console.log('Password: TestPass123!');
            process.exit(0);
        }

        // Create user
        const userId = generateUserId();
        const user = await User.create({
            user_id: userId,
            user_name: staffData.userName,
            email: staffData.email,
            password: staffData.password, // Will be hashed by beforeCreate hook
            phone_number: staffData.phoneNumber,
            role: 'SecurityStaff',
            zone: staffData.zone,
            status: 'Active'
        });

        // Create SecurityStaff profile
        const badgeNumber = generateBadgeNumber();
        await SecurityStaff.create({
            user_id: userId,
            badge_number: badgeNumber,
            shift: 'Morning',
            is_on_duty: true,
            assigned_zone: staffData.zone
        });

        console.log('\n✅ Security Staff Account Created Successfully!');
        console.log('\n📋 Account Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User ID:', userId);
        console.log('Name:', staffData.userName);
        console.log('Email:', staffData.email);
        console.log('Password:', staffData.password);
        console.log('Phone:', staffData.phoneNumber);
        console.log('Role: SecurityStaff');
        console.log('Zone:', staffData.zone);
        console.log('Badge Number:', badgeNumber);
        console.log('Status: Active');
        console.log('On Duty: Yes');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🔐 You can now login with:');
        console.log('Email:', staffData.email);
        console.log('Password:', staffData.password);
        console.log('\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating security staff:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run the script
createSecurityStaff();
