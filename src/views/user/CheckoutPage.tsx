import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAddCheckout } from '../../hooks/useOrder';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const checkoutMutation = useAddCheckout();

    // حالة واحدة فقط لتخزين العنوان
    const [address, setAddress] = useState('');

    // معالجة إرسال الطلب
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // التحقق من أن العنوان غير فارغ
        if (!address.trim()) {
            toast.error('يرجى إدخال عنوان التوصيل.');
            return;
        }

        // إرسال الكائن بالصيغة المطلوبة { address: "string" }
        toast.promise(
            checkoutMutation.mutateAsync({ address }),
            {
                loading: 'جاري معالجة الطلب... ⏳',
                success: 'تم إتمام الطلب بنجاح! 🎉',
                error: 'حدث خطأ أثناء معالجة الطلب. تأكد من رصيدك.',
            }
        ).then(() => {
            // توجيه المستخدم لصفحة ملفه الشخصي لمشاهدة الطلب
            navigate('/my-profile'); 
        }).catch((err) => {
            console.error("Checkout Error:", err);
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50/50" dir="rtl">
            <h1 className="text-2xl font-black text-gray-900 mb-6">إتمام عملية الدفع (Checkout)</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* قسم تفاصيل الشحن */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">تفاصيل التوصيل</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">العنوان بالكامل</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="أدخل المدينة، الحي، الشارع، ورقم المبنى..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                            />
                        </div>

                        {/* زر الإرسال للموبايل (يظهر في الأسفل) */}
                        <div className="md:hidden">
                            <button
                                type="submit"
                                disabled={checkoutMutation.isPending}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {checkoutMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد الطلب'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* قسم ملخص الطلب */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">تأكيد الطلب</h2>
                    
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-xs font-medium mb-6 leading-relaxed">
                        ℹ️ سيتم خصم المبلغ من محفظتك الإلكترونية، يرجى التأكد من كتابة العنوان بشكل دقيق لضمان وصول الشحنة.
                    </div>

                    {/* زر الإرسال للشاشات الكبيرة */}
                    <button
                        onClick={handleSubmit}
                        disabled={checkoutMutation.isPending}
                        className="hidden md:block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {checkoutMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد الطلب والدفع'}
                    </button>
                </div>

            </div>
        </div>
    );
}