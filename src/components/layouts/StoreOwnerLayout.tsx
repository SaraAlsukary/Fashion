import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';

const StoreOwnerLayout = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    // حالة للتحكم بظهور القائمة الجانبية في الشاشات الصغيرة
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navLinks = [
        { name: 'لوحة التحكم', path: '/admin', end: true },
        { name: 'إدارة المنتجات', path: '/admin/products' },
        { name: 'فئات المتجر', path: '/admin/categories' },
        { name: 'الألوان والمقاسات', path: '/admin/attributes' },
        { name: 'إدارة البوستات', path: '/admin/posts' },
        { name: 'بيانات المتجر', path: '/admin/settings' },
        // أضف هذا السطر داخل مصفوفة navLinks في StoreOwnerLayout
        { name: 'شكاوى الزبائن', path: '/admin/complaints' },
    ];

    // إغلاق القائمة الجانبية تلقائياً عند تغيير الصفحة (للموبايل)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);
    // أضف هذه الحالة للتحكم في تأكيد تسجيل الخروج
    const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

    const handleLogoutClick = () => {
        if (isConfirmingLogout) {
            // إذا كان في حالة التأكيد وضغط مرة أخرى، قم بتسجيل الخروج فعلياً
            logout();
        } else {
            // تحويل الزر لحالة التأكيد
            setIsConfirmingLogout(true);
            // إعادة الزر لحالته الطبيعية بعد 3 ثوانٍ إذا لم يتم التأكيد
            setTimeout(() => setIsConfirmingLogout(false), 3000);
        }
    };
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100" dir="rtl">

            {/* طبقة شفافة (Overlay) تظهر خلف القائمة في الشاشات الصغيرة عند فتحها */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-64 bg-slate-800 text-white flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-700 shrink-0">
                    <span className="text-2xl font-bold">إدارة المتجر</span>

                    {/* زر إغلاق القائمة (يظهر فقط في الموبايل) */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.end}
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-slate-700'
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700 shrink-0 bg-slate-800 mt-auto">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-slate-800 bg-amber-400 rounded-lg hover:bg-amber-500 transition-colors shadow-sm"
                    >
                        🌍 تصفح المتجر كزبون
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden h-full w-full">
                <header className="h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* زر فتح القائمة (يظهر فقط في الشاشات الصغيرة) */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* إخفاء النص في الشاشات الصغيرة جداً لتوفير المساحة */}
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 hidden sm:block">
                            مرحباً، صاحب المتجر
                        </h2>
                    </div>

                    <button
                        onClick={handleLogoutClick}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 overflow-hidden text-sm sm:text-base ${isConfirmingLogout
                                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow'
                            }`}
                    >
                        <span className="whitespace-nowrap">
                            {isConfirmingLogout ? 'تأكيد الخروج؟' : 'تسجيل الخروج'}
                        </span>

                        {/* أيقونة الخروج مع تأثيرات حركية */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-5 h-5 transition-transform duration-300 ${isConfirmingLogout ? 'animate-pulse' : 'group-hover:-translate-x-1'
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                // رسمة الأيقونة (سهم يتجه للخارج)
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </button>                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
                    <Outlet key={location.pathname} />
                </main>
            </div>

        </div>
    );
};

export default StoreOwnerLayout;