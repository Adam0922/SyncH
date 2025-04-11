import axios from 'axios';
import { message } from 'antd';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7056',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error);

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401 && !error.config.url.includes('/api/data/login')) {
                message.error('Your session has expired. Please log in again.');
                localStorage.removeItem('authToken');
                window.location.href = '/sign-in';
            } else if (error.response.status === 404) {
                console.error('Resource not found:', error.config.url);
            }
        } else if (error.request) {
            // The request was made but no response was received
            message.error('No response from server. Please check your connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            message.error('Error setting up request: ' + error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
