import { useContext } from 'react';
import { Link } from 'react-router-dom';
// تأكد من تعديل المسار أدناه ليتوافق مع مكان ملف AuthContext في مشروعك
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
    // 1. استخراج حالة التسجيل، بيانات المستخدم، ودالة الخروج من الكونتكست
    const { isAuthenticated, user, logout } = useContext(AuthContext);

    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 animate-slide-down">
            <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                {/* الشعار والروابط */}
                <div className="flex items-center gap-10">
                    <h1 className="text-2xl font-black text-moda-purple tracking-wider cursor-pointer hover:scale-105 transition-transform duration-300">
                        موضة<span className="text-moda-gold">.</span>
                    </h1>
                    <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                        <a href="#" className="text-moda-purple border-b-2 border-moda-purple pb-1">الرئيسية</a>
                        <a href="#" className="hover:text-moda-purple hover:-translate-y-1 transition-all duration-300">التصنيفات</a>
                        <a href="#" className="hover:text-moda-purple hover:-translate-y-1 transition-all duration-300">المجتمع</a>
                        <a href="#" className="hover:text-moda-purple hover:-translate-y-1 transition-all duration-300">طلباتي</a>
                    </nav>
                </div>

                {/* شريط البحث */}
                <div className="hidden lg:flex flex-1 max-w-md mx-8 group">
                    <div className="relative w-full transition-transform duration-300 group-focus-within:scale-[1.02]">
                        <input
                            type="text"
                            placeholder="ابحث عن متاجر، أزياء، أو مصممين..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 px-5 pr-11 text-sm focus:outline-none focus:border-moda-purple focus:bg-white focus:shadow-md transition-all duration-300"
                        />
                        <span className="absolute left-4 top-3 text-gray-400">🔍</span>
                    </div>
                </div>

                {/* أزرار التفاعل وحساب المستخدم */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {/* زر السلة (يظهر دائماً للزوار والأعضاء) */}
                    <button className="p-2.5 hover:bg-gray-100 rounded-full relative transition-all duration-300 hover:rotate-12 hover:scale-110" title="السلة">
                        <span className="text-xl">🛍️</span>
                        <span className="absolute top-1 right-1 bg-moda-purple text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">0</span>
                    </button>

                    <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

                    {/* 2. التحقق من حالة تسجيل الدخول باستخدام isAuthenticated */}
                    {isAuthenticated ? (
                        // واجهة المستخدم المسجل دخوله
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-12 hover:scale-110" title="الإشعارات">
                                <span className="text-xl">🔔</span>
                            </button>

                            {/* عرض اسم المستخدم وزر الخروج */}
                            <div className="flex items-center gap-3 bg-gray-50 p-1 pr-3 rounded-full border border-gray-100 shadow-sm">
                                {/* عرض اسم المستخدم من الكونتكست */}
                                <span className="text-sm font-bold text-gray-700 hidden sm:block truncate max-w-[100px]">
                                    {user?.name || 'مستخدم'}
                                </span>
                                <div className="w-8 h-8 bg-moda-purple/10 text-moda-purple rounded-full flex items-center justify-center font-bold">
                                    👤
                                </div>
                                <div className="h-4 w-[1px] bg-gray-300"></div>
                                {/* زر تسجيل الخروج المرتبط بالكونتكست */}
                                <button
                                    onClick={logout}
                                    className="text-xs text-red-500 hover:text-white hover:bg-red-500 font-bold px-3 py-1.5 rounded-full transition-colors duration-300"
                                >
                                    خروج
                                </button>
                            </div>
                        </div>
                    ) : (
                        // واجهة الزائر (أزرار تسجيل الدخول وإنشاء الحساب)
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link to={'/auth/login'} className="text-gray-600 hover:text-moda-purple font-medium text-sm transition-colors duration-300 px-2 sm:px-4 py-2">
                                دخول
                            </Link>
                            <Link to={'/auth/register'} className="bg-moda-purple hover:bg-opacity-90 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                إنشاء حساب
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;