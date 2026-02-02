import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../utils/api';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [receiverUserID, setReceiverUserID] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { socket } = useSocket();
    const { showError, showSuccess } = useNotification();

    useEffect(() => {
        fetchMessages();
        fetchUsers();

        // Listen for new messages via Socket.io
        if (socket) {
            socket.on('new_message', (message) => {
                setMessages((prev) => [message, ...prev]);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_message');
            }
        };
    }, [socket]);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/messages');
            setMessages(response.data.data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users?role=SecurityStaff');
            setUsers(response.data.data.users || []);
            if (response.data.data.users?.length > 0) {
                setReceiverUserID(response.data.data.users[0].user_id);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !receiverUserID) {
            showError('Please enter a message and select a recipient');
            return;
        }

        try {
            await api.post('/messages', {
                receiverUserID: receiverUserID,
                content: newMessage,
                priority: 'Normal'
            });

            showSuccess('Message sent successfully');
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            showError(error.response?.data?.error?.message || 'Failed to send message');
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Internal Messages</h1>
                    <p className="text-gray-600 mt-1">Communication hub for security staff</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Message List */}
                    <div className="lg:col-span-2 card">
                        <h2 className="text-xl font-bold mb-4">Recent Messages</h2>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">💬</div>
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.message_id}
                                        className={`p-4 rounded-lg ${msg.sender_user_id === user?.userId
                                                ? 'bg-primary-50 ml-8'
                                                : 'bg-gray-50 mr-8'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                                                    {msg.sender_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{msg.sender_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(msg.time_sent).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {msg.is_read ? (
                                                <span className="text-xs text-success-600">✓ Read</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Unread</span>
                                            )}
                                        </div>
                                        <p className="text-gray-900">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Send Message Form */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Send Message</h2>
                        <form onSubmit={sendMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    rows="6"
                                    className="input"
                                    placeholder="Type your message..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Send To
                                </label>
                                <select
                                    className="input"
                                    value={receiverUserID}
                                    onChange={(e) => setReceiverUserID(e.target.value)}
                                    required
                                >
                                    <option value="">Select recipient</option>
                                    {users.map((u) => (
                                        <option key={u.user_id} value={u.user_id}>
                                            {u.user_name} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                📤 Send Message
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-semibold mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="btn btn-secondary w-full text-sm">
                                    📢 Broadcast to All
                                </button>
                                <button className="btn btn-secondary w-full text-sm">
                                    🔔 Mark All as Read
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;
