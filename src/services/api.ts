import axios from 'axios';

// export const API_BASE_URL = 'http://www.marketexpress.somee.com/api';
export const API_BASE_URL = '/api';
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

// 1️⃣ Request Interceptor (تلقيم التوكن تلقائياً مع كل طلب صادر)
api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('token');
        if (token) {
            // تنظيف التوكن من أي اقتباسات زائدة الناتجة عن التخزين
            token = token.replace(/^"(.*)"$/, '$1').trim();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2️⃣ Response Interceptor (معالجة انتهاء صلاحية التوكن 401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

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
                let refreshToken = localStorage.getItem('refreshToken');
                let accessToken = localStorage.getItem('token');

                if (!refreshToken || !accessToken) {
                    isRefreshing = false;
                    reject(new Error("لا يوجد توكن متوفر للتجديد"));
                    return;
                }

                // تنظيف التوكنات قبل الإرسال
                accessToken = accessToken.replace(/^"(.*)"$/, '$1').trim();
                refreshToken = refreshToken.replace(/^"(.*)"$/, '$1').trim();

                // إرسال كلا التوكنين كما يطلب السيرفر بناءً على تجربة Swagger الناجحة
                axios.post(`${API_BASE_URL}/Auth/RefreshToken`, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                })
                    .then((response) => {
                        if (response.status === 200 && response.data.success) {

                            // الوصول للبيانات الحقيقية .data.data حسب رد السيرفر في Swagger
                            const resultData = response.data.data;

                            let newAccessToken = resultData.accessToken;
                            let newRefreshToken = resultData.refreshToken;

                            if (!newAccessToken) {
                                throw new Error("لم يتم العثور على التوكن الجديد في استجابة السيرفر");
                            }

                            // تخزين التوكنات الجديدة
                            localStorage.setItem('token', newAccessToken);

                            if (newRefreshToken) {
                                localStorage.setItem('refreshToken', newRefreshToken);
                            }

                            // تحديث طلب الـ API الحالي وتمريره للطابور
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                            processQueue(null, newAccessToken);

                            resolve(api(originalRequest));
                        } else {
                            throw new Error(response.data.message || "فشلت عملية التجديد");
                        }
                    })
                    .catch((refreshError) => {
                        console.error("فشل تجديد التوكن تماماً:", refreshError);
                        processQueue(refreshError, null);

                        // طرد المستخدم فقط إذا فشل التجديد فعلياً
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