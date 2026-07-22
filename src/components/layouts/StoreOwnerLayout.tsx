import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Outlet, NavLink, useLocation } from 'react-router-dom'; // 1. استدعاء useLocation

const StoreOwnerLayout = () => {
    const location = useLocation(); // 2. جلب المسار الحالي
    const { logout } = useContext(AuthContext);

    const navLinks = [
        { name: 'لوحة التحكم', path: '/admin', end: true },
        { name: 'إدارة المنتجات', path: '/admin/products' },
        { name: 'فئات المتجر', path: '/admin/categories' },
        { name: 'الألوان والمقاسات', path: '/admin/attributes' },
        { name: 'بيانات المتجر', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-100" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold border-b border-slate-700">
                    إدارة المتجر
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.end}
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded transition-colors ${
                                    isActive ? 'bg-blue-600' : 'hover:bg-slate-700'
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white shadow flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">مرحباً، صاحب المتجر</h2>
                    <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                        تسجيل الخروج
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* 3. إضافة key لـ Outlet هنا يحل مشكلة ثبات الصفحة */}
                    <Outlet key={location.pathname} />
                </main>
            </div>
        </div>
    );
};

export default StoreOwnerLayout;