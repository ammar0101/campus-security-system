const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

let io;

/**
 * Initialize Socket.io server
 */
const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findOne({
                where: { user_id: decoded.userID },
                attributes: ['user_id', 'user_name', 'email', 'role', 'status']
            });

            if (!user || user.status !== 'Active') {
                return next(new Error('Invalid or inactive user'));
            }

            socket.user = user.toJSON();
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user.user_name} (${socket.user.role})`);

        // Join user-specific room
        socket.join(socket.user.user_id);

        // Join role-based rooms
        if (socket.user.role === 'Admin') {
            socket.join('admins');
            socket.join('security-staff'); // Admins also get security staff updates
        } else if (socket.user.role === 'SecurityStaff') {
            socket.join('security-staff');
        }

        // Handle location updates (Security Staff only)
        socket.on('location:update', async (data) => {
            if (socket.user.role === 'SecurityStaff') {
                const { latitude, longitude } = data;

                // Update in database
                const { SecurityStaff } = require('../models');
                await SecurityStaff.update(
                    {
                        current_latitude: latitude,
                        current_longitude: longitude,
                        location_last_updated: new Date()
                    },
                    { where: { user_id: socket.user.user_id } }
                );

                // Broadcast to admins
                io.to('admins').emit('staff:location-updated', {
                    userID: socket.user.user_id,
                    userName: socket.user.user_name,
                    latitude,
                    longitude,
                    timestamp: new Date()
                });
            }
        });

        // Handle typing indicators (for messaging)
        socket.on('message:typing', (data) => {
            const { receiverID } = data;
            io.to(receiverID).emit('message:user-typing', {
                senderID: socket.user.user_id,
                senderName: socket.user.user_name
            });
        });

        socket.on('message:stop-typing', (data) => {
            const { receiverID } = data;
            io.to(receiverID).emit('message:user-stopped-typing', {
                senderID: socket.user.user_id
            });
        });

        // Handle acknowledgment events
        socket.on('alert:acknowledge', (data) => {
            const { alertID } = data;
            // This is handled by the REST API, but we can emit confirmation
            socket.emit('alert:acknowledged-confirmed', { alertID });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.user_name}`);
        });

        // Send welcome message
        socket.emit('connected', {
            message: 'Connected to Campus Security System',
            userID: socket.user.user_id,
            role: socket.user.role
        });
    });

    // Make io globally available
    global.io = io;

    console.log('✅ Socket.io server initialized');

    return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
