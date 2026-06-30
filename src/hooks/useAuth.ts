import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import{ AxiosError } from 'axios';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// 💡 تأكد من استيراد أو إعداد الـ axios instance الخاص بمشروعك
// إذا كان لديك ملف api.ts جاهز، يمكنك استيراده بدلاً من هذا الإعداد

// تعريف واجهة الأخطاء (اختياري، لتجنب أخطاء TypeScript)
interface ApiErrorResponse {
    message: string;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    // 1️⃣ دالة تسجيل الدخول (Login)
    const loginMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (credentials) => {
            const { data } = await api.post('/api/Auth/Login', credentials);
            return data;
        },
        onSuccess: () => {
            toast.success("تم تسجيل الدخول")
            // هنا يمكنك حفظ الـ Token في الـ LocalStorage أو Context
            // localStorage.setItem('token', data.token);
            navigate('/'); // التوجيه للصفحة الرئيسية بعد النجاح
        }
    });

    // 2️⃣ دالة إنشاء حساب جديد (Register)
    const registerMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (userData) => {
            const { data } = await api.post('/Auth/Register', userData);
            return data;
        },
        onSuccess: () => {
            toast.success(" يرجى تأكيد الحساب حتى تكتمل عملية انشاء الحساب")

            // التوجيه لصفحة تأكيد البريد الإلكتروني بعد إنشاء الحساب بنجاح
            navigate('/auth/confirm-email');
        }
    });

    // 3️⃣ دالة تأكيد البريد الإلكتروني عبر الـ OTP
    const confirmOtpMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (otpData) => {
            const { data } = await api.post('/Auth/ConfirmEmail', otpData);
            return data;
        },
        onSuccess: () => {
            toast.success(" تم تسجيل الدخول بنجاح")

            // التوجيه لصفحة تسجيل الدخول بعد تأكيد الحساب
            navigate('/auth/login');
        }
    });

    // 4️⃣ دالة استعادة كلمة المرور (Forgot Password)
    const forgotPasswordMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (emailData) => {
            const { data } = await api.post('/Auth/ForgotPassword', emailData);
            return data;
        },
        onSuccess: () => {
            toast.success(" تم تسجيل الخروج بنجاح")

            // التوجيه لصفحة تسجيل الدخول بعد تأكيد الحساب
            navigate('/');
        }
        // ملاحظة: معالجة النجاح والخطأ تمت داخل الـ Component نفسه لإظهار الرسالة الخضراء
    });

    return {
        // مُخرجات Login
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,

        // مُخرجات Register
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,

        // مُخرجات Confirm OTP
        confirmOtp: confirmOtpMutation.mutate,
        isConfirming: confirmOtpMutation.isPending,
        confirmError: confirmOtpMutation.error,

        // مُخرجات Forgot Password
        forgotPassword: forgotPasswordMutation.mutate,
        isSendingReset: forgotPasswordMutation.isPending,
    };
};