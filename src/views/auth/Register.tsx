import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // تأكد من صحة المسار لديك

export default function Register() {
    // 1. تجميع كل الحقول المطلوبة بناءً على الـ JSON الخاص بك
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        phoneNumber: '',
        gender: 'Male', // القيمة الافتراضية
        birthDate: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // استخراج دالة التسجيل وحالة التحميل والخطأ من الـ Hook
    const { register, isRegistering, registerError } = useAuth();

    // دالة لتحديث أي حقل ديناميكياً
    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validateForm = () => {
        let localErrors: any = {};
        if (!formData.firstName) localErrors.firstName = 'الاسم الأول مطلوب';
        if (!formData.lastName) localErrors.lastName = 'الاسم الأخير مطلوب';
        if (!formData.userName) localErrors.userName = 'اسم المستخدم مطلوب';
        if (!formData.email) localErrors.email = 'البريد الإلكتروني مطلوب';
        if (!formData.phoneNumber) localErrors.phoneNumber = 'رقم الهاتف مطلوب';
        if (!formData.birthDate) localErrors.birthDate = 'تاريخ الميلاد مطلوب';
        if (!formData.password) localErrors.password = 'كلمة المرور مطلوبة';
        else if (formData.password.length < 6) localErrors.password = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';

        setErrors(localErrors);
        return Object.keys(localErrors).length === 0;
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // تحويل تاريخ الميلاد إلى الصيغة المطلوبة ISO String قبل الإرسال
            const payload = {
                ...formData,
                birthDate: new Date(formData.birthDate).toISOString()
            };

            // 2. إرسال البيانات الكاملة إلى السيرفر
            register(payload);
        }
    };

    return (
        <div className="animate-fade-in-up delay-100 max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center lg:text-right">إنشاء حساب جديد</h2>
            <p className="text-sm text-moda-grayText mb-6 text-center lg:text-right">انضم إلينا اليوم واستمتع بتجربة تسوق فريدة!</p>

            {/* عرض أخطاء السيرفر إن وجدت */}
            {registerError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {registerError.response?.data?.message || 'فشلت عملية إنشاء الحساب، يرجى التحقق من البيانات.'}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

                {/* الاسم الأول والأخير (بجانب بعضهما في الشاشات الكبيرة) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">الاسم الأول</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="جون"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                        />
                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">الاسم الأخير</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="دوا"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                        />
                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </div>
                </div>

                {/* اسم المستخدم */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">اسم المستخدم (Username)</label>
                    <input
                        type="text"
                        value={formData.userName}
                        onChange={(e) => handleInputChange('userName', e.target.value)}
                        placeholder="johndoe123"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.userName ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                    />
                    {errors.userName && <p className="text-xs text-red-500">{errors.userName}</p>}
                </div>

                {/* البريد الإلكتروني */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="user@example.com"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* رقم الهاتف */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">رقم الهاتف</label>
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+966500000000"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                    />
                    {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
                </div>

                {/* الجنس وتاريخ الميلاد (بجانب بعضهما) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">الجنس</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none transition-all focus:border-moda-purple"
                        >
                            <option value="Male">ذكر (Male)</option>
                            <option value="Female">أنثى (Female)</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">تاريخ الميلاد</label>
                        <input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.birthDate ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                        />
                        {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate}</p>}
                    </div>
                </div>

                {/* كلمة المرور */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">كلمة المرور</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-moda-purple'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-3 text-gray-400 hover:text-moda-purple transition-colors"
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
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                {/* زر الإرسال المتجاوب مع حالة التحميل */}
                <button
                    type="submit"
                    disabled={isRegistering}
                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-md mt-4 ${isRegistering
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isRegistering ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="font-bold text-moda-purple hover:underline">
                    تسجيل الدخول
                </Link>
            </p>
        </div>
    );
}