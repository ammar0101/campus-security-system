import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const reconnectAttempts = useRef(0);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected');
            setConnected(true);
            reconnectAttempts.current = 0;
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            reconnectAttempts.current++;
            if (reconnectAttempts.current >= 5) {
                console.error('Max reconnection attempts reached');
            }
        });

        newSocket.on('connected', (data) => {
            console.log('Socket welcome:', data.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    const emit = (event, data) => {
        if (socket && connected) {
            socket.emit(event, data);
        }
    };

    const on = (event, callback) => {
        if (socket) {
            socket.on(event, callback);
        }
    };

    const off = (event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    };

    const value = {
        socket,
        connected,
        emit,
        on,
        off
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
