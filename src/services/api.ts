import axios, { type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = 'http://www.marketexpress.somee.com/api';
export const API_IMAGE = 'https://res.cloudinary.com/dosaekozq/image';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// متغيرات لإدارة طابور الطلبات المتزامنة
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 1️⃣ Request Interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        let token = localStorage.getItem('token');
        if (token && config.headers) {
            token = token.replace(/^"(.*)"$/, '$1').trim();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: unknown) => Promise.reject(error)
);

// 2️⃣ Response Interceptor (المُعَدل لحل مشكلة التزامن)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            // 💡 إذا كان هناك طلب تجديد شغال حالياً، ضع هذا الطلب في قائمة الانتظار
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                const refreshToken = localStorage.getItem('refreshToken');
                const accessToken = localStorage.getItem('token');

                if (!refreshToken) {
                    isRefreshing = false;
                    reject(new Error("No refresh token available"));
                    return;
                }

                // إرسال الطلب بالأسماء المطلوبة من الباك اند كاملاً
                axios.post(`${API_BASE_URL}/Auth/RefreshToken`, {
                    accessToken: accessToken?.replace(/^"(.*)"$/, '$1').trim(),
                    refreshToken: refreshToken.replace(/^"(.*)"$/, '$1').trim()
                })
                    .then((response) => {
                        if (response.status === 200) {
                            // 1. اطبع الاستجابة في الكونسول لتراها بعينك وتتأكد من أسماء الحقول
                            console.log("Refresh Response Data:", response.data);

                            // 2. تأكد من الاسم الصحيح (مثلاً لو كان Token أو accessToken)
                            let newAccessToken = response.data.accessToken || response.data.token;
                            let newRefreshToken = response.data.refreshToken;

                            if (!newAccessToken) {
                                console.error("لم يتم العثور على Access Token في استجابة السيرفر!");
                                throw new Error("Invalid token response");
                            }

                            // 3. تنظيف التوكنات الجديدة من أي علامات اقتباس زائدة قبل التخزين
                            newAccessToken = newAccessToken.replace(/^"(.*)"$/, '$1').trim();
                            localStorage.setItem('token', newAccessToken);

                            if (newRefreshToken) {
                                newRefreshToken = newRefreshToken.replace(/^"(.*)"$/, '$1').trim();
                                localStorage.setItem('refreshToken', newRefreshToken);
                                console.log("تم تحديث الـ Refresh Token بنجاح");
                            }

                            // تحديث طلب الاكسيوس الحالي وتمريره للطابور
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                            processQueue(null, newAccessToken);

                            resolve(api(originalRequest));
                        }
                    })
                    .catch((refreshError) => {
                        // إذا فشل التجديد كلياً، نرفض كل الطلبات المنتظرة ونوجه للوجن
                        processQueue(refreshError, null);

                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/auth/login';

                        reject(refreshError);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default api;