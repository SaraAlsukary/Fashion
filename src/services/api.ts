import axios, { type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = 'http://www.marketexpress.somee.com/api';
export const API_IMAGE = 'https://res.cloudinary.com/dosaekozq/image';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1️⃣ Request Interceptor: لإضافة التوكن الحالي مع كل طلب
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

// 2️⃣ Response Interceptor: للقبض على خطأ 401 وتجديد التوكن تلقائياً
api.interceptors.response.use(
    (response) => response, // إذا كان الطلب ناجحاً، نمرره طبيعي
    async (error) => {
        const originalRequest = error.config;

        // التحقق مما إذا كان الخطأ 401 (غير مصرح) وأن الطلب لم تتم إعادة محاولته مسبقاً
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // نضع علامة لمنع الدخول في حلقة تكرار لا نهائية

            try {
                // جلب الـ refreshToken المحفوظ (يجب أن يقوم مبرمج الباك اند بحفظه لكِ عند اللوجن)
                const refreshToken = localStorage.getItem('refreshToken');
                const accessToken = localStorage.getItem('token');

                if (!refreshToken) {
                    // إذا لم يكن هناك ريفريش توكن، نوجه المستخدم للوجن
                    throw new Error("No refresh token available");
                }

                // إرسال طلب للباك اند لتجديد التوكن
                // ⚠️ ملاحظة: تأكدي من مبرمج الباك اند عن شكل الـ Body المطلوب (هل يحتاج التوكنين معاً أم الريفريش فقط؟)
                const response = await axios.post(`${API_BASE_URL}/Auth/RefreshToken`, {
                    accessToken: accessToken?.replace(/^"(.*)"$/, '$1').trim(),
                    refreshToken: refreshToken.replace(/^"(.*)"$/, '$1').trim()
                });

                if (response.status === 200) {
                    // الباك اند سيعيد لكِ Access Token جديد (وغالباً Refresh Token جديد أيضاً)
                    const newAccessToken = response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;

                    // حفظ التوكنات الجديدة في المتصفح
                    localStorage.setItem('token', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // تحديث الهيدر للطلب الأصلي بالتوكن الجديد وإعادة تنفيذه
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("❌ فشل تجديد التوكن، يجب تسجيل الدخول مجدداً:", refreshError);
                // هنا يمكنك مسح الـ localStorage وتوجيه المستخدم لصفحة تسجيل الدخول
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                // window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;