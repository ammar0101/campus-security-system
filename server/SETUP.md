# Backend Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (running locally)
   - Host: localhost
   - Port: 5432
   - Database: campus_security (will be created)
   - User: postgres
   - Password: Awsqdrfe_1

## Installation Steps

### 1. Enable PowerShell Script Execution (Windows)

Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Install Dependencies

```bash
cd server
npm install
```

This will install all required packages:
- express, pg, sequelize (core)
- bcryptjs, jsonwebtoken (authentication)
- socket.io (real-time)
- multer (file uploads)
- helmet, cors, express-rate-limit (security)
- nodemailer (mock email)
- And more...

### 3. Create PostgreSQL Database

Open PostgreSQL command line (psql) or pgAdmin and run:
```sql
CREATE DATABASE campus_security;
```

Or use command line:
```bash
psql -U postgres
CREATE DATABASE campus_security;
\q
```

### 4. Run Database Migration

This creates all tables:
```bash
npm run migrate
```

### 5. Seed Initial Data

This creates test users and sample data:
```bash
npm run seed
```

**Test Credentials:**
- Admin: `admin@campus.edu` / `Admin@123456`
- Security Staff: `security@campus.edu` / `Security@123`
- Student: `student@campus.edu` / `Student@123`

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Verify Installation

### Check Health Endpoint

Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Campus Security System API is running",
  "timestamp": "2026-02-02T...",
  "environment": "development"
}
```

### Test Authentication

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@campus.edu\",\"password\":\"Admin@123456\"}"
```

You should receive a JWT token in the response.

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-restart)
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests (when implemented)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Student/Visitor)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Incidents
- `POST /api/incidents` - Create incident
- `POST /api/incidents/emergency-panic` - Activate emergency panic
- `GET /api/incidents` - List incidents
- `GET /api/incidents/:incidentID` - Get incident details
- `PATCH /api/incidents/:incidentID/status` - Update status
- `PATCH /api/incidents/:incidentID/location` - Update location
- `DELETE /api/incidents/:incidentID` - Cancel incident

### Alerts
- `POST /api/alerts` - Create and broadcast alert
- `GET /api/alerts` - List alerts
- `GET /api/alerts/:alertID` - Get alert details
- `POST /api/alerts/:alertID/acknowledge` - Acknowledge alert
- `DELETE /api/alerts/:alertID` - Cancel alert

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:userID` - Get user details
- `PATCH /api/users/:userID` - Update user profile
- `PATCH /api/users/:userID/status` - Change user status
- `DELETE /api/users/:userID` - Delete user

### Locations
- `POST /api/locations` - Create location (Admin)
- `GET /api/locations` - List locations
- `GET /api/locations/nearby` - Find nearby locations
- `GET /api/locations/:locationID` - Get location details

### Messages (Security Staff)
- `POST /api/messages` - Send message
- `GET /api/messages` - List messages
- `PATCH /api/messages/:messageID/read` - Mark as read
- `DELETE /api/messages/:messageID` - Delete message

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/incidents` - Incident analytics
- `GET /api/analytics/export` - Export data (Admin)

### Settings (Admin only)
- `GET /api/settings` - Get all settings
- `GET /api/settings/:settingKey` - Get specific setting
- `PATCH /api/settings/:settingKey` - Update setting

## WebSocket Events

Connect to Socket.io at `http://localhost:5000` with JWT token in auth.

### Client → Server Events
- `location:update` - Update security staff location
- `message:typing` - Typing indicator
- `message:stop-typing` - Stop typing
- `alert:acknowledge` - Acknowledge alert

### Server → Client Events
- `connected` - Connection confirmation
- `incident:created` - New incident created
- `incident:updated` - Incident updated
- `alert:broadcast` - New alert broadcast
- `alert:cancelled` - Alert cancelled
- `alert:acknowledged` - Alert acknowledged by user
- `message:received` - New message received
- `message:user-typing` - User is typing
- `staff:location-updated` - Staff location updated

## Environment Variables

All configured in `.env`:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DB_*` - PostgreSQL connection settings
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CLIENT_URL` - Frontend URL for CORS

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `netstat -ano | findstr :5000`

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall

### Migration Fails
- Drop and recreate database
- Check PostgreSQL logs

## Project Structure

```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, RBAC, error handling
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Mock services (email, push, upload)
│   ├── socket/          # Socket.io server
│   ├── utils/           # Helper functions
│   ├── database/        # Migration & seed scripts
│   ├── app.js           # Express app
│   └── server.js        # HTTP server
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies
```

## Next Steps

1. Test all API endpoints with Postman or curl
2. Verify Socket.io connections
3. Move to frontend development
4. Integrate frontend with backend APIs

## Support

For issues:
1. Check server logs
2. Verify database connection
3. Test endpoints individually
4. Check CORS settings if frontend can't connect
