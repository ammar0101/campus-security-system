import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Register = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        role: 'Student',
        // Student fields
        studentID: '',
        major: '',
        yearLevel: 'Year 1',
        // Visitor fields
        purposeOfVisit: '',
        visitStart: '',
        visitEnd: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        const userData = {
            userName: formData.userName,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            role: formData.role
        };

        if (formData.role === 'Student') {
            userData.studentID = formData.studentID;
            userData.major = formData.major;
            userData.yearLevel = formData.yearLevel;
        } else if (formData.role === 'Visitor') {
            userData.purposeOfVisit = formData.purposeOfVisit;
            userData.visitStart = formData.visitStart;
            userData.visitEnd = formData.visitEnd;
        }

        const result = await register(userData);

        if (result.success) {
            showSuccess('Registration successful! Your account is pending approval.');
            navigate('/login');
        } else {
            showError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-primary-100">Join Campus Security System</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="userName"
                                    required
                                    value={formData.userName}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="you@campus.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="+1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role *
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Visitor">Visitor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Student-specific fields */}
                        {formData.role === 'Student' && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Student Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student ID *
                                        </label>
                                        <input
                                            type="text"
                                            name="studentID"
                                            required
                                            value={formData.studentID}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="STU0000001"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Major *
                                        </label>
                                        <input
                                            type="text"
                                            name="major"
                                            required
                                            value={formData.major}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Computer Science"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Year Level *
                                        </label>
                                        <select
                                            name="yearLevel"
                                            value={formData.yearLevel}
                                            onChange={handleChange}
                                            className="input"
                                        >
                                            <option value="Year 1">Year 1</option>
                                            <option value="Year 2">Year 2</option>
                                            <option value="Year 3">Year 3</option>
                                            <option value="Year 4">Year 4</option>
                                            <option value="Graduate">Graduate</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visitor-specific fields */}
                        {formData.role === 'Visitor' && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Visitor Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Purpose of Visit *
                                        </label>
                                        <textarea
                                            name="purposeOfVisit"
                                            required
                                            value={formData.purposeOfVisit}
                                            onChange={handleChange}
                                            className="input"
                                            rows="3"
                                            placeholder="Describe your purpose of visit..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Visit Start Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="visitStart"
                                                required
                                                value={formData.visitStart}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Visit End Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="visitEnd"
                                                required
                                                value={formData.visitEnd}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
