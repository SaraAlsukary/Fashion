import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
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

    // داخل المكون:

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    // 1️⃣ دالة تسجيل الدخول (Login)
const loginMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
    mutationFn: async (credentials) => {
        const { data } = await api.post('/Auth/Login', credentials);
        return data;
    },
    onSuccess: (data) => {
        toast.success("تم تسجيل الدخول بنجاح");
        
        // استخراج البيانات من الاستجابة
        const token = data.data.jwtAuthResult.accessToken;
        const refreshToken = data.data.jwtAuthResult.refreshToken.refreshTokenString;
        const roles = data.data.getRoles; 

        // حفظ التوكن في الـ LocalStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        // تحويل مصفوفة الكائنات إلى مصفوفة نصوص لتسهيل الفحص 
        // النتيجة ستكون مثلاً: ["User", "SuperAdmin"]
        const roleNames = roles.map((role: { name: string }) => role.name);

        // تحديث حالة المستخدم في الـ Context
        context.setUser({ token, roles: roleNames, isAuthenticated: true });

        // 💡 فحص الأدوار والتوجيه بناءً عليها
        if (roleNames.includes('SuperAdmin')) {
            // توجيه السوبر أدمن
            navigate('/super-admin'); 
        } 
        else if (roleNames.includes('Admin')) {
            // توجيه الأدمن العادي
            navigate('/admin'); 
        } 
        else {
            // التوجيه الافتراضي للمستخدم العادي
            navigate('/'); 
        }
    },
    onError: (err) => {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        console.error(err);
    }
});

    // 2️⃣ دالة إنشاء حساب جديد (Register)
    const registerMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (userData) => {
            const { data } = await api.post('/Auth/Register', userData);
            return data;
        },
        onSuccess: (userData) => {
            toast.success(" يرجى تأكيد الحساب حتى تكتمل عملية انشاء الحساب")
            
            // التوجيه لصفحة تأكيد البريد الإلكتروني بعد إنشاء الحساب بنجاح
            navigate('/auth/confirm-email', { state: { email: userData.email } });
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
    // 3️⃣ دالة تأكيد البريد الإلكتروني عبر الـ OTP
    const confirmPasswordForOtpMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (otpData) => {
            const { data } = await api.post('/Auth/ConfirmEmail', otpData);
            return data;
        },
        onSuccess: (userData) => {
            toast.success(" تم تأكيد رمز التحقق")
            navigate('/auth/reset-password', { state: { email: userData.email, code: userData.code } });

            // التوجيه لصفحة تسجيل الدخول بعد تأكيد الحساب
        }
    });

    // 4️⃣ دالة استعادة كلمة المرور (Forgot Password)
    const forgotPasswordMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (emailData) => {
            // نرسل هنا كائن مثل { email: "..." }
            const { data } = await api.post('/Auth/ForgotPassword', emailData);
            return data;
        },
        // المعامل الأول (data) هو رد السيرفر، المعامل الثاني (variables) هو ما أرسلته للدالة
        onSuccess: (_, variables) => {
            toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
            
            // 💡 الحل هنا: نأخذ الإيميل من variables وليس من رد السيرفر
            navigate('/auth/reset-password', { state: { email: variables.email } });
        }
    });
    const ResendOtpMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (emailData) => {
            const { data } = await api.post('/Auth/ResendOtpCode', emailData);
            return data;
        },
        onSuccess: () => {
            toast.success(" تم اعادة ارسال رمز التحقق")

        }
    });
    const ResetPasswordMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (userData) => {
            const { data } = await api.post('/Auth/ResetPassword', userData);
            console.log(data)
            return data;

        },
        onSuccess: () => {
            toast.success(" تم تغيير كلمة المرور")
            navigate('/auth/login')

        }
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

        // مُخرجات Confirm OTP for reset password
        confirmPasswordForOtp: confirmPasswordForOtpMutation.mutate,
        isConfirmingForPassword: confirmPasswordForOtpMutation.isPending,
        confirmingForPasswordError: confirmPasswordForOtpMutation.error,

        // reset otp
        resendOtp: ResendOtpMutation.mutate,
        isResending: ResendOtpMutation.isPending,
        resendError: ResendOtpMutation.error,


        // reset Password
        resetPassword: ResetPasswordMutation.mutate,
        isResetting: ResetPasswordMutation.isPending,
        resetError: ResetPasswordMutation.error,
    };
};