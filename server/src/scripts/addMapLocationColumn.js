const { sequelize } = require('../config/database');

async function addMapLocationColumn() {
    try {
        console.log('🔧 Adding map_location column to incidents table...\n');

        // Add map_location column to store location descriptions
        await sequelize.query(`
            ALTER TABLE incidents 
            ADD COLUMN IF NOT EXISTS map_location VARCHAR(255);
        `);

        console.log('✅ Successfully added map_location column!\n');
        console.log('You can now create incidents with location descriptions.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addMapLocationColumn();
