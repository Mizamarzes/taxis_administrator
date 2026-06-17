import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const api = axios.create({
    baseURL: `${apiUrl}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const AUTH_ENDPOINTS = ['auth/login', 'auth/logout', 'auth/profile'];

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl: string = error.config?.url ?? '';
        const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));

        if (error.response?.status === 401 && !isAuthEndpoint) {
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
