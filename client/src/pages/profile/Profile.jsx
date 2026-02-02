import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../utils/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                userName: user.userName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.patch(`/users/${user.userID}`, {
                user_name: formData.userName,
                phone_number: formData.phoneNumber
            });

            // Update localStorage with new user data
            const updatedUser = {
                ...user,
                userName: formData.userName,
                phoneNumber: formData.phoneNumber
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showSuccess('Profile updated successfully');

            // Reload page to refresh user data in UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            showError(error.response?.data?.error?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            showSuccess('Password changed successfully');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showError(error.response?.data?.error?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>

                {/* User Info Card */}
                <div className="card">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                            {user?.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user?.userName}</h2>
                            <p className="text-gray-600">{user?.role}</p>
                            <p className="text-sm text-gray-500">ID: {user?.userId}</p>
                        </div>
                    </div>
                </div>

                {/* Update Profile Form */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="input bg-gray-100 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={user?.role}
                                    disabled
                                    className="input bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="input"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
