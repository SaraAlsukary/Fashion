import { useState } from 'react';
import { Link } from 'react-router-dom';
// تأكد من تعديل مسار الاستيراد بناءً على مجلدات مشروعك
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // حالة لإظهار رسالة النجاح

    // 1. استخراج دالة الطلب وحالة الانتظار من الهوك
    const { forgotPassword, isSendingReset } = useAuth();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleRequestReset = (e: any) => {
        e.preventDefault();
        setLocalError('');
        setIsSuccess(false);

        if (!email) {
            setLocalError('يرجى إدخال البريد الإلكتروني');
            return;
        }
        if (!validateEmail(email)) {
            setLocalError('صيغة البريد الإلكتروني غير صحيحة');
            return;
        }

        // 2. استدعاء الدالة وتمرير البريد، مع معالجة النتيجة مباشرة عبر خيارات الـ Mutation
        forgotPassword(
            { email },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    setEmail(''); // تفريغ الحقل بعد النجاح
                },
                onError: (err: any) => {
                    setLocalError(err.response?.data?.message || 'حدث خطأ غير متوقع أثناء إرسال طلب الاستعادة.');
                }
            }
        );
    };

    return (
        <div className="animate-fade-in-up delay-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h2>
            <p className="text-sm text-moda-grayText mb-8">
                لا تقلق! أدخل بريدك الإلكتروني المرتبط بحسابك وسنرسل لك تعليمات استعادة الوصول.
            </p>

            {/* 3. تنبيه النجاح: يظهر فقط عندما يرد السيرفر بنجاح */}
            {isSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-600">
                    تم إرسال تعليمات استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح. يرجى مراجعة صندوق الوارد.
                </div>
            )}

            {/* تنبيه الأخطاء (المحلية أو أخطاء الخادم) */}
            {localError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {localError}
                </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        disabled={isSendingReset}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${localError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                            }`}
                    />
                </div>

                {/* 4. تكييف أداء وزر الإرسال مع حالة المعالجة الحالية */}
                <button
                    type="submit"
                    disabled={isSendingReset}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-2 ${isSendingReset
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isSendingReset ? 'جاري الإرسال...' : 'إرسال تعليمات الاستعادة'}
                </button>
            </form>

            <div className="text-center mt-8">
                <Link to="/auth/login" className="text-sm font-bold text-moda-purple hover:underline">
                    ← العودة إلى تسجيل الدخول
                </Link>
            </div>
        </div>
    );
}