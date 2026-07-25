// components/layouts/SuperAdminLayout.tsx
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUser'; // 👈 استيراد الهوك

const SuperAdminLayout = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    // 👈 جلب بيانات الملف الشخصي
    const { data: userProfile, isLoading } = useUserProfile();

    const navLinks = [
        { name: 'الرئيسية', path: '/super-admin' },
        { name: 'طلبات المتاجر', path: '/super-admin/requests' },
        { name: 'إدارة الأدوار', path: '/super-admin/roles' },
        // { name: 'العمليات المالية', path: '/super-admin/transactions' },
        { name: 'إدارة المستخدمين', path: '/super-admin/users' },
        { name: 'إدارة الفئات', path: '/super-admin/categories' },
        { name: 'ملفي الشخصي', path: '/super-admin/profile' }, // 👈 التبويب الجديد
    ];

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogoutClick = () => {
        if (isConfirmingLogout) {
            logout();
        } else {
            setIsConfirmingLogout(true);
            setTimeout(() => setIsConfirmingLogout(false), 3000);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-64 bg-slate-800 text-white flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-700 shrink-0">
                    <span className="text-2xl font-bold">لوحة الإدارة</span>

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
            <div className="flex-1 flex flex-col overflow-hidden w-full">

                {/* Header */}
                <header className="h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        {/* زر فتح القائمة للموبايل */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* 👈 الجزء الخاص بعرض بيانات المستخدم */}
                        <div className="hidden sm:flex items-center gap-3">
                            {isLoading ? (
                                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                                <>
                                    {/* الصورة الشخصية أو أول حرف من الاسم */}
                                    {userProfile?.profilePhoto ? (
                                        <img src={userProfile.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                                            {userProfile?.firstName?.charAt(0) || 'M'}
                                        </div>
                                    )}
                                    
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-800">
                                            مرحباً، {userProfile?.firstName} {userProfile?.lastName}
                                        </h2>
                                        <p className="text-xs text-gray-500">{userProfile?.email}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleLogoutClick}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 overflow-hidden text-sm sm:text-base ${
                            isConfirmingLogout
                                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow'
                        }`}
                    >
                        <span className="whitespace-nowrap">
                            {isConfirmingLogout ? 'تأكيد الخروج؟' : 'تسجيل الخروج'}
                        </span>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-5 h-5 transition-transform duration-300 ${
                                isConfirmingLogout ? 'animate-pulse' : 'group-hover:-translate-x-1'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;