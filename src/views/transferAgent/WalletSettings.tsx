// pages/WalletSettings.tsx
import  { useState } from 'react';
import { useWallet, useAddWallet } from '../../hooks/useWallet';

const WalletSettings = () => {
    const { data: walletData, isLoading, isError } = useWallet();
    const { mutate: createWallet, isPending: isCreatingWallet } = useAddWallet();

    // حالة وهمية لإعدادات الإشعارات (تُربط بـ API لاحقاً)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">جاري تحميل إعدادات المحفظة...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">إعدادات المحفظة</h2>

            {/* حالة عدم وجود محفظة */}
            {isError || !walletData ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد محفظة نشطة</h3>
                    <p className="text-gray-600 mb-6">يجب إنشاء محفظة أولاً لتتمكن من إدارة إعداداتها.</p>
                    <button 
                        onClick={() => createWallet()}
                        disabled={isCreatingWallet}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 font-medium"
                    >
                        {isCreatingWallet ? 'جاري الإنشاء...' : 'إنشاء محفظة الآن'}
                    </button>
                </div>
            ) : (
                /* حالة وجود محفظة نشطة */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* القسم الأول: بيانات المحفظة الأساسية */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">المعلومات الأساسية</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">معرف المحفظة (ID)</label>
                                <div className="bg-gray-50 p-3 rounded-lg text-gray-800 font-mono text-sm border border-gray-100">
                                    {walletData.id || 'غير متوفر'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">الرصيد الحالي</label>
                                <div className="bg-gray-50 p-3 rounded-lg text-emerald-700 font-bold text-lg border border-emerald-100 flex items-center justify-between">
                                    <span dir="ltr">{walletData.balance?.toLocaleString()}</span>
                                    <span className="text-sm font-normal text-emerald-600">SYP</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">حالة الحساب</label>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-green-700 font-medium text-sm">نشط وجاهز للتحويل</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* القسم الثاني: التفضيلات والأمان (واجهة فقط حالياً) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">التفضيلات والأمان</h3>
                        <div className="space-y-6">
                            
                            {/* مفتاح تبديل الإشعارات */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800">إشعارات التحويلات</h4>
                                    <p className="text-xs text-gray-500 mt-1">تلقي تنبيه عند نجاح أو فشل أي تحويل.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={notificationsEnabled}
                                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 rtl:peer-checked:after:-translate-x-full"></div>
                                </label>
                            </div>

                            {/* زر وهمي لتغيير الرقم السري / التوثيق */}
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="font-medium text-gray-800 mb-2">حماية المحفظة</h4>
                                <p className="text-xs text-gray-500 mb-3">يوصى بتفعيل المصادقة الثنائية أو رمز PIN إضافي.</p>
                                <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    إعداد رمز مرور إضافي (PIN)
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default WalletSettings;