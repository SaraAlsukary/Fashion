import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResendOtp() {
    const location = useLocation();
    const navigate = useNavigate();

    // استلام الإيميل من التوجيه أو الذاكرة كقيمة مبدئية إن وجد
    const [email, setEmail] = useState(location.state?.email || localStorage.getItem('pendingEmail') || '');
    const [emailError, setEmailError] = useState('');

    // استدعاء دالة إعادة الإرسال من الـ hook
    const { resendOtp, isResending, resendError } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // التحقق من صحة البريد الإلكتروني
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        // إرسال الإيميل فقط لاستدعاء دالة إعادة الإرسال
        resendOtp({ email: email }, {
            onSuccess: () => {
                // (اختياري) يمكنك توجيه المستخدم لصفحة تأكيد الكود بعد نجاح الإرسال
                navigate('/auth/confirm-email', { state: { email } });
            }
        });
    };

    return (
        <div className="animate-fade-in-up delay-100 text-center lg:text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إعادة إرسال كود التحقق</h2>
            <p className="text-sm text-gray-500 mb-8">
                أدخل بريدك الإلكتروني أدناه وسنقوم بإرسال كود تحقق جديد إليك.
            </p>

            {/* عرض رسالة الخطأ القادمة من الباك إند إن وجدت */}
            {resendError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
                    {/* @ts-ignore - لتجنب خطأ التايب سكريبت المؤقت */}
                    {resendError.response?.data?.message || 'حدث خطأ أثناء الإرسال. يرجى التأكد من البريد والمحاولة مجدداً.'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* حقل إدخال البريد الإلكتروني */}
                <div className="text-right">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                    </label>
                    <input
                        type="email"
                        id="email"
                        dir="ltr"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError('');
                        }}
                        disabled={isResending}
                        className={`w-full p-3.5 rounded-xl border focus:ring-1 outline-none transition-all shadow-sm ${emailError
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple bg-gray-50 focus:bg-white'
                            }`}
                        placeholder="example@mail.com"
                    />
                    {emailError && <p className="text-xs text-red-500 mt-2">{emailError}</p>}
                </div>

                {/* زر الإرسال */}
                <button
                    type="submit"
                    disabled={isResending}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4 ${isResending
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isResending ? 'جاري الإرسال...' : 'إرسال الكود'}
                </button>
            </form>
        </div>
    );
}