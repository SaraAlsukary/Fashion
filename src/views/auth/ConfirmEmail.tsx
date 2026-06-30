import { useState } from 'react';
// تأكد من تعديل مسار الاستيراد بناءً على مجلدات مشروعك
import { useAuth } from '../../hooks/useAuth';

export default function ConfirmEmail() {
    const [otp, setOtp] = useState(['', '', '', '','','']);
    const [localError, setLocalError] = useState('');

    // 1. استخراج دوال ومتغيرات التأكيد من الهوك
    const { confirmOtp, isConfirming, confirmError } = useAuth();

    const handleChange = (element: any, index: any) => {
        if (isNaN(element.value)) return false;

        setLocalError(''); // إخفاء الخطأ المحلي عند الكتابة
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // النقل التلقائي للمربع التالي
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const otpValue = otp.join('');

        // الكود الجديد
        if (otpValue.length < 6) {
            setLocalError('يرجى إدخال كود التحقق بالكامل (6 أرقام)');
            return;
        }                                                                                   

        // 2. إرسال كود OTP إلى السيرفر عبر الهوك
        confirmOtp({ code: otpValue });
    };

    return (
        <div className="animate-fade-in-up delay-100 text-center lg:text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تأكيد البريد الإلكتروني</h2>
            <p className="text-sm text-moda-grayText mb-8">
                أرسلنا كود التحقق (OTP) إلى بريدك الإلكتروني. الرجاء إدخاله أدناه.
            </p>

            {/* 3. عرض الأخطاء القادمة من السيرفر (كود منتهي الصلاحية أو خاطئ) */}
            {confirmError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
                    {confirmError.response?.data?.message || 'كود التحقق غير صحيح أو انتهت صلاحيته.'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-center lg:justify-start gap-3" dir="ltr">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={data}
                            disabled={isConfirming}
                            onChange={e => handleChange(e.target, index)}
                            onFocus={e => e.target.select()}
                            className={`w-14 h-14 text-center text-xl font-bold rounded-xl border focus:ring-1 outline-none bg-gray-50 focus:bg-white transition-all shadow-sm ${localError || confirmError
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'
                                }`}
                        />
                    ))}
                </div>
                {localError && <p className="text-xs text-red-500 text-center lg:text-right mt-2">{localError}</p>}

                {/* 4. تعطيل الزر وتغيير حالته أثناء إرسال الطلب */}
                <button
                    type="submit"
                    disabled={isConfirming}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4 ${isConfirming
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isConfirming ? 'جاري التأكيد...' : 'تأكيد الحساب'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <span>لم تستلم الكود؟</span>
                <button className="font-bold text-moda-purple hover:underline flex items-center gap-1" type="button">
                    إعادة إرسال الكود <span>↻</span>
                </button>
            </div>
        </div>
    );
}