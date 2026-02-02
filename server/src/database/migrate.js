const { sequelize, testConnection } = require('../config/database');

const migrate = async () => {
    try {
        console.log('🔄 Starting database migration...\n');

        // Test connection
        await testConnection();

        // Sync all models (creates tables)
        console.log('Creating/updating database tables...');
        await sequelize.sync({ alter: true }); // Use alter to update existing tables

        console.log('\n✅ Database migration completed successfully!');
        console.log('📊 All tables have been created/updated.\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Run migration if called directly
if (require.main === module) {
    migrate()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { migrate };
