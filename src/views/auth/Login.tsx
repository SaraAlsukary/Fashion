import { useState } from 'react';
import { Link } from 'react-router-dom';
// تأكد من تعديل مسار الاستيراد بناءً على مجلدات مشروعك
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    // 1. استخراج دوال ومتغيرات تسجيل الدخول من الهوك
    const { login, isLoggingIn, loginError } = useAuth();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = (e:any) => {
        e.preventDefault();
        let currentErrors = { email: '', password: '' };
        let isValid = true;

        if (!email) {
            currentErrors.email = 'البريد الإلكتروني مطلوب';
            isValid = false;
        } else if (!validateEmail(email)) {
            currentErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
            isValid = false;
        }

        if (!password) {
            currentErrors.password = 'كلمة المرور مطلوبة';
            isValid = false;
        }

        setErrors(currentErrors);

        if (isValid) {
            // 2. تمرير البيانات إلى السيرفر عبر دالة الـ login من الهوك
            login({ email, password });
        }
    };

    return (
        <div className="animate-fade-in-up delay-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
            <p className="text-sm text-moda-grayText mb-8">مرحباً بعودتك! يرجى إدخال بياناتك للمتابعة.</p>

            {/* 3. عرض رسالة الخطأ القادمة من السيرفر إذا فشلت العملية */}
            {loginError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {loginError.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                            }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700">كلمة المرور</label>
                        <Link to="/auth/forgot-password" className="text-xs font-bold text-moda-purple hover:underline">
                            نسيت كلمة المرور؟
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-3.5 text-gray-400 hover:text-moda-purple transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* 4. إعداد زر الإرسال ليتجاوب مع حالة التحميل ومنع ضغط الزر مرتين */}
                <button
                    type="submit"
                    disabled={isLoggingIn}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4 ${isLoggingIn
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isLoggingIn ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
                ليس لديك حساب؟{' '}
                <Link to="/auth/register" className="font-bold text-moda-purple hover:underline">
                    إنشاء حساب جديد
                </Link>
            </p>
        </div>
    );
}