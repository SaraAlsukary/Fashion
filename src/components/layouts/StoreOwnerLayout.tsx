import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';

const StoreOwnerLayout = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const navLinks = [
        { name: 'لوحة التحكم', path: '/admin', end: true },
        { name: 'إدارة المنتجات', path: '/admin/products' },
        { name: 'فئات المتجر', path: '/admin/categories' },
        { name: 'الألوان والمقاسات', path: '/admin/attributes' },
        { name: 'بيانات المتجر', path: '/admin/settings' },
    ];

    return (
        // تم إضافة overflow-hidden لمنع التمدد خارج الشاشة
        <div className="flex h-screen overflow-hidden bg-gray-100" dir="rtl">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col h-full">
                {/* تم إضافة shrink-0 لمنع تقلص هذا العنصر */}
                <div className="p-4 text-2xl font-bold border-b border-slate-700 shrink-0">
                    إدارة المتجر
                </div>

                {/* تم إضافة overflow-y-auto لجعل الروابط قابلة للتمرير إذا كثرت، ولا تدفع الزر للخارج */}
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

                {/* 👇 زر العودة للمتجر كزبون */}
                {/* تم إضافة shrink-0 لضمان بقاء الزر بحجمه الطبيعي في الأسفل */}
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
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                <header className="h-16 bg-white shadow flex items-center justify-between px-6 shrink-0">
                    <h2 className="text-xl font-semibold text-gray-800">مرحباً، صاحب المتجر</h2>
                    <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                        تسجيل الخروج
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    <Outlet key={location.pathname} />
                </main>
            </div>
        </div>
    );
};

export default StoreOwnerLayout;