const http = require('http');
const app = require('./app');
const { testConnection, sequelize } = require('./config/database');
const { initializeSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database models (auto-update schema for new fields)
        await sequelize.sync({ alter: true }); // TEMPORARY: Set to true to add lat/lng columns
        console.log('✅ Database models synced successfully');

        // Start listening
        server.listen(PORT, () => {
            console.log('\n🚀 ========================================');
            console.log(`🚀 Campus Security System API Server`);
            console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🚀 API URL: http://localhost:${PORT}`);
            console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
            console.log('🚀 ========================================\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');

    server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
            await sequelize.close();
            console.log('✅ Database connection closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    });
});

process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT received. Shutting down gracefully...');

    server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
            await sequelize.close();
            console.log('✅ Database connection closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    });
});

// Start the server
startServer();
