import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useGetCartItems } from '../../hooks/useCart';

const Header = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const { data: cartResponse } = useGetCartItems();
    const navigate = useNavigate();

    const cartItemsCount = isAuthenticated ? (cartResponse?.data?.cartItemDto?.length || 0) : 0;

    // 1️⃣ حالة (State) لحفظ نص البحث
    const [searchQuery, setSearchQuery] = useState('');

    // 2️⃣ دالة تنفيذ البحث وتوجيه المستخدم
    const handleSearch = (e?: React.KeyboardEvent | React.MouseEvent) => {
        // إذا كان الحدث من لوحة المفاتيح ولم يكن زر Enter، لا تفعل شيئاً
        if (e && 'key' in e && e.key !== 'Enter') return;

        // التأكد من أن حقل البحث ليس فارغاً
        if (searchQuery.trim()) {
            // توجيه المستخدم لصفحة نتائج البحث وتمرير الكلمة في الرابط
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            // اختياري: تفريغ الحقل بعد البحث
            // setSearchQuery(''); 
        }
    };

    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 animate-slide-down">
            <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                {/* الشعار والروابط */}
                <div className="flex items-center gap-10">
                    <h1 onClick={() => navigate('/')} className="text-2xl font-black text-moda-purple tracking-wider cursor-pointer hover:scale-105 transition-transform duration-300">
                        موضة<span className="text-moda-gold">.</span>
                    </h1>
                    <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                        <Link to={'/'} className="text-moda-purple border-b-2 border-moda-purple pb-1">الرئيسية</Link>
                        <Link to={'/stores'} className="hover:text-moda-purple hover:-translate-y-1 transition-all duration-300">المتاجر</Link>
                    </nav>
                </div>

                {/* شريط البحث المحدث */}
                <div className="hidden lg:flex flex-1 max-w-md mx-8 group">
                    <div className="relative w-full transition-transform duration-300 group-focus-within:scale-[1.02]">
                        <input
                            type="text"
                            value={searchQuery} // ربط الحقل بالحالة
                            onChange={(e) => setSearchQuery(e.target.value)} // تحديث الحالة عند الكتابة
                            onKeyDown={handleSearch} // الاستماع لزر Enter
                            placeholder="ابحث عن متاجر، أزياء، أو مصممين..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 px-5 pr-11 text-sm focus:outline-none focus:border-moda-purple focus:bg-white focus:shadow-md transition-all duration-300"
                        />
                        {/* جعل الأيقونة قابلة للنقر لتنفيذ البحث أيضاً */}
                        <span
                            onClick={handleSearch}
                            className="absolute left-4 top-3 text-gray-400 cursor-pointer hover:text-moda-purple transition-colors duration-300"
                            title="ابحث"
                        >
                            🔍
                        </span>
                    </div>
                </div>

                {/* أزرار التفاعل وحساب المستخدم */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {/* زر السلة */}
                    <Link to={'/cart'} className="p-2.5 hover:bg-gray-100 rounded-full relative transition-all duration-300 hover:rotate-12 hover:scale-110" title="السلة">
                        <span className="text-xl">🛍️</span>
                        {cartItemsCount > 0 && (
                            <span className="absolute top-1 right-1 bg-moda-purple text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>

                    <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

                    {/* التحقق من حالة تسجيل الدخول */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-12 hover:scale-110" title="الإشعارات">
                                <span className="text-xl">🔔</span>
                            </button>

                            <div className="flex items-center gap-3 bg-gray-50 p-1 pr-3 rounded-full border border-gray-100 shadow-sm">
                                <span onClick={() => navigate('/my-profile')} className="text-sm font-bold text-gray-700 hidden sm:block truncate max-w-[100px] cursor-pointer">
                                    {user?.name || 'مستخدم'}
                                </span>
                                <div onClick={() => navigate('/my-profile')} className="w-8 h-8 bg-moda-purple/10 text-moda-purple rounded-full flex items-center justify-center font-bold cursor-pointer">
                                    👤
                                </div>
                                <div className="h-4 w-[1px] bg-gray-300"></div>
                                <button
                                    onClick={logout}
                                    className="text-xs text-red-500 hover:text-white hover:bg-red-500 font-bold px-3 py-1.5 rounded-full transition-colors duration-300"
                                >
                                    خروج
                                </button>
                            </div>
                        </div>
                    ) : (
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
    );
};

export default Header;