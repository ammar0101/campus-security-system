import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SecurityStaffDashboard from './pages/dashboards/SecurityStaffDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import VisitorDashboard from './pages/dashboards/VisitorDashboard';

// Incident Pages
import IncidentList from './pages/incidents/IncidentList';
import IncidentDetail from './pages/incidents/IncidentDetail';
import CreateIncident from './pages/incidents/CreateIncident';
import EmergencyPanic from './pages/emergency/EmergencyPanic';

// Alert Pages
import AlertList from './pages/alerts/AlertList';
import AlertDetail from './pages/alerts/AlertDetail';
import CreateAlert from './pages/alerts/CreateAlert';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/settings/Settings';
import Analytics from './pages/analytics/Analytics';

// Profile
import Profile from './pages/profile/Profile';

// Student Pages
import PersonalHistory from './pages/student/PersonalHistory';

// Messages & Locations
import Messages from './pages/messages/Messages';
import Locations from './pages/locations/Locations';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Dashboard Router based on role
const DashboardRouter = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case 'Admin':
            return <AdminDashboard />;
        case 'SecurityStaff':
            return <SecurityStaffDashboard />;
        case 'Student':
            return <StudentDashboard />;
        case 'Visitor':
            return <VisitorDashboard />;
        default:
            return <Navigate to="/login" replace />;
    }
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardRouter />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardRouter />
                    </ProtectedRoute>
                }
            />

            {/* Emergency Panic - All authenticated users */}
            <Route
                path="/emergency"
                element={
                    <ProtectedRoute>
                        <EmergencyPanic />
                    </ProtectedRoute>
                }
            />

            {/* Personal History - Students only */}
            <Route
                path="/my-incidents"
                element={
                    <ProtectedRoute allowedRoles={['Student']}>
                        <PersonalHistory />
                    </ProtectedRoute>
                }
            />

            {/* Incidents */}
            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>
                        <IncidentList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidents/create"
                element={
                    <ProtectedRoute>
                        <CreateIncident />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidents/:id"
                element={
                    <ProtectedRoute>
                        <IncidentDetail />
                    </ProtectedRoute>
                }
            />

            {/* Alerts */}
            <Route
                path="/alerts"
                element={
                    <ProtectedRoute>
                        <AlertList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/alerts/create"
                element={
                    <ProtectedRoute allowedRoles={['Admin', 'SecurityStaff']}>
                        <CreateAlert />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/alerts/:id"
                element={
                    <ProtectedRoute>
                        <AlertDetail />
                    </ProtectedRoute>
                }
            />

            {/* Messages - Security Staff only */}
            <Route
                path="/messages"
                element={
                    <ProtectedRoute allowedRoles={['Admin', 'SecurityStaff']}>
                        <Messages />
                    </ProtectedRoute>
                }
            />

            {/* Locations */}
            <Route
                path="/locations"
                element={
                    <ProtectedRoute>
                        <Locations />
                    </ProtectedRoute>
                }
            />

            {/* Analytics */}
            <Route
                path="/analytics"
                element={
                    <ProtectedRoute allowedRoles={['Admin', 'SecurityStaff']}>
                        <Analytics />
                    </ProtectedRoute>
                }
            />

            {/* Settings - Admin only */}
            <Route
                path="/settings"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            {/* User Management - Admin only */}
            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <UserManagement />
                    </ProtectedRoute>
                }
            />

            {/* Profile */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <NotificationProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </NotificationProvider>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
