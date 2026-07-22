// components/layouts/SuperAdminLayout.tsx
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Outlet, Link, useLocation } from 'react-router-dom';

const SuperAdminLayout = () => {
    const location = useLocation();
    const {  logout } = useContext(AuthContext);

    const navLinks = [
        { name: 'الرئيسية', path: '/super-admin' },
        { name: 'طلبات المتاجر', path: '/super-admin/requests' },
        { name: 'إدارة الأدوار', path: '/super-admin/roles' },
        { name: 'العمليات المالية', path: '/super-admin/transactions' },
        { name: 'إدارة المستخدمين', path: '/super-admin/users' },
        { name: 'إدارة الفئات', path: '/super-admin/categories' },
    ];

    return (
        <div className="flex h-screen bg-gray-100" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold border-b border-slate-700">
                    لوحة الإدارة
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`block px-4 py-2 rounded transition-colors ${
                                location.pathname === link.path
                                    ? 'bg-blue-600'
                                    : 'hover:bg-slate-700'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white shadow flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold">مرحباً، المدير العام</h2>
                    <button      onClick={logout} className="text-red-500 hover:text-red-700 font-medium">
                        تسجيل الخروج
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* هنا سيتم تندر الصفحات الداخلية */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;