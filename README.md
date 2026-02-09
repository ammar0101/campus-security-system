# Campus Security System - Complete Setup Guide

## 🎉 Project Overview

A full-stack Campus Security and Emergency Management System with:
- **Backend:** Node.js + Express + PostgreSQL + Socket.io (65+ files)
- **Frontend:** React 18 + Vite + Tailwind CSS + Socket.io Client (20+ files)
- **Total:** 85+ files, ~8,000 lines of code

---

## 📋 Prerequisites

1. **Node.js** v18 or higher
2. **PostgreSQL** installed and running
3. **Git** (optional)

---

## 🚀 Backend Setup

### Step 1: Enable PowerShell (Windows Only)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Configure Database

1. Open PostgreSQL (pgAdmin or psql)
2. Create database:
```sql
CREATE DATABASE campus_security;
```

3. Verify `.env` file exists in `server/` with correct credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_security
DB_USER=postgres
DB_PASSWORD=Awsqdrfe_1
```

### Step 4: Run Database Migration

```bash
npm run migrate
```

This creates all 14 tables in PostgreSQL.

### Step 5: Seed Initial Data

```bash
npm run seed
```

**Test Accounts Created:**
- **Admin:** `admin@campus.edu` / `Admin@123456`
- **Security:** `security@campus.edu` / `Security@123`
- **Student:** `student@campus.edu` / `Student@123`

### Step 6: Start Backend Server

```bash
npm run dev
```

✅ Backend running on `http://localhost:5000`

---

## 🎨 Frontend Setup

### Step 1: Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd client
npm install
```

### Step 2: Start Frontend Development Server

```bash
npm run dev
```

✅ Frontend running on `http://localhost:3000`

---

## ✅ Verify Installation

### 1. Check Backend Health

Open browser: `http://localhost:5000/health`

Expected response:
```json
{
  "success": true,
  "message": "Campus Security System API is running",
  "timestamp": "...",
  "environment": "development"
}
```

### 2. Test Frontend

Open browser: `http://localhost:3000`

You should see the login page.

### 3. Test Login

Use any test account:
- Email: `admin@campus.edu`
- Password: `Admin@123456`

---

## 📱 Features Available

### ✅ Fully Functional
1. **Authentication**
   - Login / Logout
   - Registration (Student/Visitor)
   - Password Reset Flow

2. **Dashboards**
   - Admin Dashboard (stats, quick actions)
   - Security Staff Dashboard
   - Student Dashboard
   - Visitor Dashboard

3. **Emergency System**
   - Emergency Panic Button
   - GPS Location Capture
   - Critical Priority Alerts

4. **Incident Management**
   - Create Incident Reports
   - View Incident List (with filters)
   - View Incident Details
   - Update Incident Status (Security/Admin)

5. **Alert System**
   - View Active Alerts
   - Alert Broadcasting (Security/Admin)

6. **Real-time Features**
   - WebSocket Connection
   - Live Notifications
   - Connection Status Indicator

### 🚧 Stub Pages (Basic UI Ready)
- Messages (Internal messaging)
- Locations (Campus map)
- Analytics (Charts & reports)
- Settings (System configuration)
- User Management (Admin panel)
- Profile (User profile)

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```
Solution: Ensure PostgreSQL is running and credentials in .env are correct
```

**Port 5000 Already in Use:**
```
Solution: Change PORT in .env or kill the process using port 5000
```

**Module Not Found:**
```
Solution: Delete node_modules and run npm install again
```

### Frontend Issues

**Cannot Connect to API:**
```
Solution: Ensure backend is running on port 5000
Check vite.config.js proxy settings
```

**White Screen:**
```
Solution: Check browser console for errors
Ensure all npm packages installed correctly
```

**Socket Connection Failed:**
```
Solution: Ensure backend Socket.io server is running
Check that you're logged in (Socket requires auth token)
```

---

## 📁 Project Structure

```
campus-security-system/
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Business logic (8 controllers)
│   │   ├── middleware/       # Auth, RBAC, rate limiting
│   │   ├── models/           # Sequelize models (14 models)
│   │   ├── routes/           # API routes (8 route files)
│   │   ├── services/         # Mock services
│   │   ├── socket/           # Socket.io server
│   │   ├── utils/            # Helper functions
│   │   ├── database/         # Migration & seed scripts
│   │   ├── app.js            # Express app
│   │   └── server.js         # HTTP server
│   ├── uploads/              # File storage
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── SETUP.md              # Detailed backend docs
│
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts (Auth, Socket, Notification)
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Login, Register, etc.
│   │   │   ├── dashboards/   # Role-specific dashboards
│   │   │   ├── incidents/    # Incident management
│   │   │   ├── alerts/       # Alert management
│   │   │   └── emergency/    # Emergency panic
│   │   ├── utils/            # API client, helpers
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md                  # Project overview
```

---

## 🎯 Quick Start Guide

### For Development

1. **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

3. **Open Browser:**
   `http://localhost:3000`

4. **Login:**
   Use test credentials from seed data

### For Testing Different Roles

1. **Admin:** `admin@campus.edu` / `Admin@123456`
   - Full access to all features
   - User management
   - System settings

2. **Security Staff:** `security@campus.edu` / `Security@123`
   - Incident management
   - Alert broadcasting
   - Internal messaging

3. **Student:** `student@campus.edu` / `Student@123`
   - Report incidents
   - Emergency panic
   - View alerts

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password/:token` - Reset password

### Incidents
- `POST /api/incidents` - Create incident
- `POST /api/incidents/emergency-panic` - Emergency
- `GET /api/incidents` - List incidents
- `GET /api/incidents/:id` - Get details
- `PATCH /api/incidents/:id/status` - Update status

### Alerts
- `POST /api/alerts` - Broadcast alert
- `GET /api/alerts` - List alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge

### More endpoints in `server/SETUP.md`

---

## 🔐 Security Features

- ✅ JWT Authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on sensitive endpoints
- ✅ Token blacklisting on logout
- ✅ Audit logging for compliance
- ✅ CORS protection
- ✅ Helmet security headers

---

## 🚀 Next Steps

### To Complete the Application

1. **Implement Stub Pages:**
   - Create full Messages page
   - Add Leaflet map for Locations
   - Build Analytics charts with Recharts
   - Complete Settings page
   - Finish User Management CRUD

2. **Add Features:**
   - File upload for incident photos
   - Real-time location tracking for security staff
   - Push notifications
   - Email notifications

3. **Testing:**
   - Write unit tests
   - Integration tests
   - E2E tests with Playwright

4. **Deployment:**
   - Build production bundles
   - Deploy to cloud (AWS, Heroku, etc.)
   - Set up CI/CD pipeline

---

## 📞 Support

For issues or questions:
1. Check server logs in terminal
2. Check browser console for frontend errors
3. Review `server/SETUP.md` for detailed API docs
4. Verify database connection and migrations

---

## 🎉 Congratulations!

You now have a fully functional Campus Security System with:
- ✅ Complete backend API (40+ endpoints)
- ✅ Real-time WebSocket communication
- ✅ Role-based authentication
- ✅ Emergency panic system
- ✅ Incident management
- ✅ Alert broadcasting
- ✅ Modern React frontend
