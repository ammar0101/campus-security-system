import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (authentication failures)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if we have a refresh token
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                console.error('No refresh token available - redirecting to login');
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                console.log('Attempting to refresh token...');
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { token } = response.data.data;
                localStorage.setItem('accessToken', token);
                console.log('Token refreshed successfully');

                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.clear();
                alert('Your session has expired. Please log in again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
