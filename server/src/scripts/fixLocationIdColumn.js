const { sequelize } = require('../config/database');

async function fixLocationIdColumn() {
    try {
        console.log('🔧 Updating incidents table to allow NULL location_id...\n');

        // Alter the table to allow NULL values in location_id column
        await sequelize.query(`
            ALTER TABLE incidents 
            ALTER COLUMN location_id DROP NOT NULL;
        `);

        console.log('✅ Successfully updated location_id column to allow NULL values!\n');
        console.log('You can now create incidents with location descriptions.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixLocationIdColumn();
