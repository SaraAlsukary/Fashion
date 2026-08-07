import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ConfirmEmail() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [localError, setLocalError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ✅ جلب الإيميل من التوجيه، وإذا كان مفقوداً نجلبه من الذاكرة المحلية
    const userEmail = location.state?.email || localStorage.getItem('pendingEmail');

    const { confirmOtp, isConfirming, confirmError, resendOtp, isResending } = useAuth();

    // حماية: إذا لم يكن هناك إيميل نهائياً، أعده لصفحة التسجيل
    useEffect(() => {
        if (!userEmail) {
            navigate('/auth/register');
        }
    }, [userEmail, navigate]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;
        if (isNaN(Number(value))) return;

        setLocalError('');
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (!/^\d+$/.test(pasteData)) return;

        const digits = pasteData.slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, index) => {
            newOtp[index] = digit;
        });
        setOtp(newOtp);

        const focusIndex = Math.min(digits.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length < 6) {
            setLocalError('يرجى إدخال كود التحقق بالكامل (6 أرقام)');
            return;
        }

        // 🚨🚨 الحل لمشكلة 400 يكمن هنا 🚨🚨
        // إذا استمر الخطأ 400، اسأل مطور الباك إند عن اسم الحقول المطلوبة، أو جرب تغييرها إلى:
        // confirmOtp({ Email: userEmail, Code: otpValue });
        // أو:
        // confirmOtp({ email: userEmail, otp: otpValue });
        
        confirmOtp({ email: userEmail, code: otpValue });
    };

    const handleResendOtp = () => {
        if (!userEmail) return;
        resendOtp({ email: userEmail });
    };

    // بعد نجاح التأكيد، يُفضل مسح الإيميل من الذاكرة المحلية (يتم عمل ذلك عادة في onSuccess داخل useAuth)

    return (
        <div className="animate-fade-in-up delay-100 text-center lg:text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تأكيد البريد الإلكتروني</h2>
            <p className="text-sm text-gray-500 mb-8">
                أرسلنا كود التحقق إلى: <strong className="text-gray-700">{userEmail}</strong>
            </p>

            {confirmError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
                    {confirmError.response?.data?.message || 'خطأ 400: تأكد من أن أسماء الحقول مطابقة للباك إند أو أن الكود صحيح.'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-center gap-2 sm:gap-3 w-full" dir="ltr">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            ref={(el:any) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={data}
                            disabled={isConfirming}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            onFocus={(e) => e.target.select()}
                            className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold rounded-xl border focus:ring-1 outline-none bg-gray-50 focus:bg-white transition-all shadow-sm ${
                                localError || confirmError
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                            }`}
                        />
                    ))}
                </div>
                {localError && <p className="text-xs text-red-500 text-center lg:text-right mt-2">{localError}</p>}

                <button
                    type="submit"
                    disabled={isConfirming}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4 ${
                        isConfirming
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                    }`}
                >
                    {isConfirming ? 'جاري التأكيد...' : 'تأكيد الحساب'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <span>لم تستلم الكود؟</span>
                <button
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className={`font-bold text-moda-purple hover:underline flex items-center gap-1 ${
                        isResending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    type="button"
                >
                    {isResending ? (
                        <span>جاري إعادة الإرسال...</span>
                    ) : (
                        <>
                            إعادة إرسال الكود <span className="animate-spin-slow">↻</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}