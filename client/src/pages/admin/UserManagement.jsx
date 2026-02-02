import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        userName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'SecurityStaff',
        zone: ''
    });
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = filter !== 'all' ? `?role=${filter}` : '';
            const response = await api.get(`/users${params}`);
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/users/${userId}/status`, {
                status: currentStatus === 'Active' ? 'Suspended' : 'Active'
            });
            showSuccess('User status updated');
            fetchUsers();
        } catch (error) {
            showError('Failed to update user status');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/users/${userId}`);
            showSuccess('User deleted successfully');
            fetchUsers();
        } catch (error) {
            showError('Failed to delete user');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        try {
            await api.post('/auth/create-staff', {
                userName: createFormData.userName,
                email: createFormData.email,
                password: createFormData.password,
                phoneNumber: createFormData.phoneNumber,
                role: createFormData.role,
                zone: createFormData.zone || null
            });

            showSuccess(`${createFormData.role} account created successfully`);
            setShowCreateModal(false);
            setCreateFormData({
                userName: '',
                email: '',
                password: '',
                phoneNumber: '',
                role: 'SecurityStaff',
                zone: ''
            });
            fetchUsers();
        } catch (error) {
            showError(error.response?.data?.error?.message || 'Failed to create user');
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            Admin: 'danger',
            SecurityStaff: 'primary',
            Student: 'success',
            Visitor: 'warning'
        };
        return colors[role] || 'secondary';
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">Manage system users and permissions</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                    >
                        ➕ Create User
                    </button>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All Users
                        </button>
                        <button
                            onClick={() => setFilter('Admin')}
                            className={`btn ${filter === 'Admin' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Admins
                        </button>
                        <button
                            onClick={() => setFilter('SecurityStaff')}
                            className={`btn ${filter === 'SecurityStaff' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Security Staff
                        </button>
                        <button
                            onClick={() => setFilter('Student')}
                            className={`btn ${filter === 'Student' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setFilter('Visitor')}
                            className={`btn ${filter === 'Visitor' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Visitors
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="card overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Name</th>
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Role</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Joined</th>
                                    <th className="text-right py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.user_id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{u.user_name}</td>
                                        <td className="py-3 px-4">{u.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`badge badge-${getRoleBadgeColor(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`badge badge-${u.status === 'Active' ? 'success' : 'danger'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => toggleUserStatus(u.user_id, u.status)}
                                                className="text-sm text-primary-600 hover:underline"
                                            >
                                                {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u.user_id)}
                                                className="text-sm text-danger-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-2">Create New User</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                                <strong>ℹ️ Admin Access Only:</strong> Create Security Staff and Administrator accounts here.
                                Students and Visitors can self-register via the public registration page.
                            </p>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={createFormData.userName}
                                    onChange={(e) => setCreateFormData({ ...createFormData, userName: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    value={createFormData.email}
                                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={createFormData.phoneNumber}
                                    onChange={(e) => setCreateFormData({ ...createFormData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    value={createFormData.password}
                                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                    minLength="8"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role *
                                </label>
                                <select
                                    className="input"
                                    value={createFormData.role}
                                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                                    required
                                >
                                    <option value="SecurityStaff">Security Staff</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zone (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={createFormData.zone}
                                    onChange={(e) => setCreateFormData({ ...createFormData, zone: e.target.value })}
                                    placeholder="e.g., North Campus, Building A"
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    Create User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserManagement;
