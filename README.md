# Campus Security and Emergency Management System

A comprehensive full-stack web application for campus security management with real-time incident reporting, emergency panic activation, alert broadcasting, and internal security staff messaging.

## 🎯 Features

### For All Users
- **Emergency Panic Button**: GPS-based emergency alert with countdown timer
- **Real-time Alerts**: Instant notifications for campus-wide emergencies
- **Incident Reporting**: Submit and track security incidents with photo uploads
- **Interactive Maps**: Leaflet-based campus maps showing incidents and locations

### For Security Staff
- **Real-time Dashboard**: Live incident monitoring and assignment
- **Internal Messaging**: Direct and broadcast messaging between staff
- **Location Tracking**: GPS tracking of on-duty staff members
- **Incident Management**: Assign, update, and resolve incidents

### For Administrators
- **User Management**: Approve, suspend, and manage all user accounts
- **Analytics Dashboard**: Comprehensive charts and metrics (Recharts)
- **Alert Broadcasting**: Create and send targeted alerts by role/zone
- **System Settings**: Configure all system parameters
- **Audit Logs**: Complete activity tracking for compliance

### For Students & Visitors
- **Quick Incident Reporting**: Easy-to-use incident submission forms
- **Emergency Access**: One-tap emergency panic button
- **Alert Notifications**: Receive campus safety alerts
- **Visit Management**: (Visitors) Track visit details and pass information

## 🛠️ Technology Stack

### Frontend
- **React 18+** with Hooks
- **React Router v6** for navigation
- **Socket.io-client** for real-time communication
- **Leaflet** + react-leaflet for interactive maps
- **Recharts** for analytics visualization
- **React Hook Form** + Yup for form validation
- **Axios** for HTTP requests
- **react-toastify** for notifications
- **Tailwind CSS** for styling

### Backend
- **Node.js v18+**
- **Express.js v4** for REST API
- **MongoDB** + Mongoose ODM
- **Socket.io** for WebSocket server
- **JWT** for authentication
- **Multer** + Cloudinary for file uploads
- **Nodemailer** for email notifications
- **Firebase Cloud Messaging** for push notifications
- **bcrypt** for password hashing
- **node-cron** for scheduled jobs

## 📁 Project Structure

```
campus-security-system/
├── client/          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── contexts/
│       ├── hooks/
│       └── utils/
├── server/          # Express backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── jobs/
│   └── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- Cloudinary account
- Firebase project (for FCM)

### Installation

1. **Clone the repository**
   ```bash
   cd campus-security-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/campus-security
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-refresh-token-secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1

## 👥 User Roles

### Admin
- Full system access
- User management and approval
- System settings configuration
- Analytics and reporting
- Alert broadcasting

### Security Staff
- Incident management
- Real-time location tracking
- Internal messaging
- Alert creation
- Emergency response

### Student
- Incident reporting
- Emergency panic button
- Receive alerts
- Track own incidents

### Visitor
- Limited incident reporting
- Emergency panic button
- Visit information tracking
- Receive alerts

## 🗄️ Database Collections

1. **User** - Base user information
2. **Admin** - Admin-specific data
3. **SecurityStaff** - Security staff details
4. **Student** - Student information
5. **Visitor** - Visitor details
6. **Incident** - All incident reports
7. **Location** - Campus locations
8. **Alert** - Alert broadcasts
9. **AlertRecipients** - Alert delivery tracking
10. **AlertLocation** - Alert-location relationships
11. **Message** - Internal messaging
12. **SystemSettings** - Configuration
13. **AuditLog** - Activity logs
14. **Analytics** - Pre-aggregated metrics

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Audit logging for compliance

## 📊 Key Features Detail

### Emergency Panic System
- 5-second countdown with cancel option
- GPS location capture
- Manual location fallback (map selection)
- Instant notification to all on-duty security staff
- Critical priority incident creation
- Emergency contact notification

### Real-time Communication
- WebSocket-based live updates
- Incident status changes
- Alert broadcasting
- Staff location tracking
- Typing indicators in messaging

### Analytics Dashboard
- Incident trends by type, status, zone
- Response time metrics
- Staff performance tracking
- Alert delivery statistics
- Interactive charts (Recharts)

## 🔧 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

### Incidents
- `POST /incidents` - Create incident
- `POST /incidents/emergency-panic` - Emergency panic
- `GET /incidents` - List incidents
- `GET /incidents/:id` - Get incident details
- `PATCH /incidents/:id/status` - Update status
- `DELETE /incidents/:id` - Cancel incident

### Alerts
- `POST /alerts` - Create alert
- `GET /alerts` - List alerts
- `PATCH /alerts/:id/acknowledge` - Acknowledge alert
- `PATCH /alerts/:id/cancel` - Cancel alert

### And more... (see API documentation)

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Role-specific dashboards
- Interactive Leaflet maps
- Real-time notifications
- Toast messages
- Loading states
- Error handling
- Empty states
- Breadcrumb navigation

## 📱 Progressive Web App (PWA)

- Offline capability
- Push notifications
- Add to home screen
- Service worker caching

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Development Team

Built with ❤️ for campus safety and security.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📞 Support

For support, email security@university.edu or create an issue in the repository.
