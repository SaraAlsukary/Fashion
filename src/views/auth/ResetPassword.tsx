import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// تأكد من تعديل مسار الاستيراد بناءً على مجلدات مشروعك
import { useAuth } from '../../hooks/useAuth';

export default function ResetPassword() {
    const location = useLocation();
    // جلب البريد الإلكتروني من المسار السابق إن وجد (مثل صفحة نسيت كلمة المرور)
    const initialEmail = location.state?.email || '';

    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 💡 حالة محلية لتأكيد كلمة المرور

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // لإظهار/إخفاء حقل التأكيد

    // إضافة حقل confirmPassword لكائن الأخطاء
    const [errors, setErrors] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });

    // 1. استخراج دوال ومتغيرات إعادة تعيين كلمة المرور من الهوك
    const { resetPassword, isResetting, resetError } = useAuth();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        let currentErrors = { email: '', code: '', newPassword: '', confirmPassword: '' };
        let isValid = true;

        // التحقق من وجود البريد الإلكتروني القادم من الـ state
        if (!initialEmail) {
            currentErrors.email = 'البريد الإلكتروني مفقود، يرجى إعادة محاولة العملية';
            isValid = false;
        } else if (!validateEmail(initialEmail)) {
            currentErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
            isValid = false;
        }

        // التحقق من كود التحقق
        if (!code) {
            currentErrors.code = 'كود التحقق مطلوب';
            isValid = false;
        }

        // التحقق من كلمة المرور الجديدة
        if (!newPassword) {
            currentErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
            isValid = false;
        } else if (newPassword.length < 6) {
            currentErrors.newPassword = 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل';
            isValid = false;
        }

        // 💡 التحقق من تطابق كلمتي المرور (حالة محلية فقط)
        if (!confirmPassword) {
            currentErrors.confirmPassword = 'يرجى تأكيد كلمة المرور الجديدة';
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            currentErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
            isValid = false;
        }

        setErrors(currentErrors);

        if (isValid) {
            // 2. تمرير البيانات المطلوبة فقط إلى السيرفر عبر الهوك (بدون حقل التأكيد)
            resetPassword({ email: initialEmail, code, newPassword });
        }
    };

    return (
        <div className="animate-fade-in-up delay-100 text-center lg:text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إعادة تعيين كلمة المرور</h2>
            <p className="text-sm text-moda-grayText mb-8">
                الرجاء إدخال كود التحقق الذي وصلك، وكلمة المرور الجديدة مع تأكيدها.
            </p>

            {/* عرض رسالة الخطأ العامة أو المتعلقة بالبريد مسبقاً */}
            {(resetError || errors.email) && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center lg:text-right">
                    {errors.email || resetError?.response?.data?.message || 'تأكد من صحة البيانات أو صلاحية كود التحقق.'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-right">

                {/* حقل كود التحقق */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">كود التحقق</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="أدخل كود التحقق هنا"
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${errors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                            }`}
                    />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>

                {/* حقل كلمة المرور الجديدة */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">كلمة المرور الجديدة</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
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
                    {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
                </div>

                {/* 💡 حقل تأكيد كلمة المرور الجديدة المضاف */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-4 top-3.5 text-gray-400 hover:text-moda-purple transition-colors"
                        >
                            {showConfirmPassword ? (
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
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* 4. إعداد زر الإرسال ليتجاوب مع حالة التحميل */}
                <button
                    type="submit"
                    disabled={isResetting}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4 ${isResetting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isResetting ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
                تذكرت كلمة المرور؟{' '}
                <Link to="/auth/login" className="font-bold text-moda-purple hover:underline">
                    تسجيل الدخول
                </Link>
            </p>
        </div>
    );
}