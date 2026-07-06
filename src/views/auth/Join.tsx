import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Join() {
    // حالة لتخزين نوع الحساب المختار: 'user' أو 'store'
    const [accountType, setAccountType] = useState('');
    const navigate = useNavigate();

    const handleContinue = () => {
        // توجيه المستخدم بناءً على اختياره
        if (accountType === 'user') {
            navigate('/auth/register'); // عدل المسار حسب الرابط في مشروعك
        } else if (accountType === 'store') {
            navigate('/auth/store'); // عدل المسار حسب الرابط في مشروعك
        }
    };

    return (
        <div className="animate-fade-in-up delay-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h2>
            <p className="text-sm text-moda-grayText mb-8">يرجى تحديد نوع الحساب الذي ترغب بإنشائه للمتابعة.</p>

            <div className="space-y-4 mb-8">
                {/* خيار: مستخدم عادي */}
                <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className={`w-full p-4 rounded-xl border-2 text-right transition-all flex items-center gap-4 outline-none ${accountType === 'user'
                            ? 'border-moda-purple bg-purple-50/50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                >
                    <div className={`p-3 rounded-full transition-colors ${accountType === 'user' ? 'bg-moda-purple text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {/* أيقونة المستخدم */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`font-bold ${accountType === 'user' ? 'text-moda-purple' : 'text-gray-900'}`}>
                            مستخدم عادي
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">تصفح المنتجات واشتري ما تحتاجه بكل سهولة.</p>
                    </div>
                </button>

                {/* خيار: حساب متجر */}
                <button
                    type="button"
                    onClick={() => setAccountType('store')}
                    className={`w-full p-4 rounded-xl border-2 text-right transition-all flex items-center gap-4 outline-none ${accountType === 'store'
                            ? 'border-moda-purple bg-purple-50/50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                >
                    <div className={`p-3 rounded-full transition-colors ${accountType === 'store' ? 'bg-moda-purple text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {/* أيقونة المتجر */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.999 2.999 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`font-bold ${accountType === 'store' ? 'text-moda-purple' : 'text-gray-900'}`}>
                            حساب متجر
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">افتح متجرك الخاص وابدأ ببيع منتجاتك للعملاء.</p>
                    </div>
                </button>
            </div>

            {/* زر المتابعة - يتم تفعيله فقط إذا تم اختيار نوع الحساب */}
            <button
                onClick={handleContinue}
                disabled={!accountType}
                className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4 ${!accountType
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                    }`}
            >
                متابعة
            </button>

            <p className="text-center text-sm text-gray-500 mt-8">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="font-bold text-moda-purple hover:underline">
                    تسجيل الدخول
                </Link>
            </p>
        </div>
    );
}