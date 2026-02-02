import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../utils/api';
import { useNotification } from '../../contexts/NotificationContext';

const Settings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(response.data.data.settings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (settingKey, newValue) => {
        try {
            await api.patch(`/settings/${settingKey}`, { value: newValue });
            showSuccess('Setting updated successfully');
            fetchSettings();
        } catch (error) {
            showError('Failed to update setting');
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-1">Configure system-wide settings</p>
                </div>

                {/* General Settings */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">General Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">System Name</h3>
                                <p className="text-sm text-gray-600">Campus Security System</p>
                            </div>
                            <button className="btn btn-secondary text-sm">Edit</button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Emergency Contact</h3>
                                <p className="text-sm text-gray-600">+1-234-567-8900</p>
                            </div>
                            <button className="btn btn-secondary text-sm">Edit</button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Campus Address</h3>
                                <p className="text-sm text-gray-600">123 University Ave, Campus City</p>
                            </div>
                            <button className="btn btn-secondary text-sm">Edit</button>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Email Notifications</h3>
                                <p className="text-sm text-gray-600">Send email alerts for critical incidents</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Push Notifications</h3>
                                <p className="text-sm text-gray-600">Send push notifications to mobile devices</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">SMS Alerts</h3>
                                <p className="text-sm text-gray-600">Send SMS for emergency situations</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Two-Factor Authentication</h3>
                                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Session Timeout</h3>
                                <p className="text-sm text-gray-600">Auto-logout after 30 minutes of inactivity</p>
                            </div>
                            <select className="input w-32">
                                <option>15 min</option>
                                <option selected>30 min</option>
                                <option>60 min</option>
                                <option>Never</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Password Expiry</h3>
                                <p className="text-sm text-gray-600">Force password change every 90 days</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button className="btn btn-primary px-8">Save All Settings</button>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
