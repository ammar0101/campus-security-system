const { sequelize } = require('../config/database');

async function addMapLocationColumnDirect() {
    try {
        console.log('🔧 Adding map_location column to incidents table...\n');

        // First check if column exists
        const [existing] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'incidents' 
            AND column_name = 'map_location';
        `);

        if (existing.length > 0) {
            console.log('ℹ️  map_location column already exists!\n');
        } else {
            // Add the column
            await sequelize.query(`
                ALTER TABLE incidents 
                ADD COLUMN map_location VARCHAR(255);
            `);
            console.log('✅ Successfully added map_location column!\n');
        }

        // Verify it was added
        const [verify] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'incidents'
            AND column_name = 'map_location';
        `);

        if (verify.length > 0) {
            console.log('✅ Verification:');
            console.log(`   Column: ${verify[0].column_name}`);
            console.log(`   Type: ${verify[0].data_type}`);
            console.log(`   Nullable: ${verify[0].is_nullable}\n`);
            console.log('🎉 Database is ready! You can now create incidents with location descriptions.\n');
        } else {
            console.log('❌ Column was not added successfully.\n');
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await sequelize.close();
        process.exit(1);
    }
}

addMapLocationColumnDirect();
