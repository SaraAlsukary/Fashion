import axios, { type InternalAxiosRequestConfig } from 'axios';
export 
const API_BASE_URL = 'http://www.marketexpress.somee.com/api'; // استبدله برابط موقع Somee الخاص بك
export const API_IMAGE = 'https://res.cloudinary.com/dosaekozq/image'


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);

export default api;