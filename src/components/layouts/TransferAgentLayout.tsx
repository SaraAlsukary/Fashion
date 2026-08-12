// components/layouts/TransferAgentLayout.tsx
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUser'; // استيراد الهوك
import { getSecureImageUrl } from '../../constant/imageURL';

const TransferAgentLayout = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    // جلب بيانات الملف الشخصي
    const { data: userProfile, isLoading } = useUserProfile();

    // الروابط المخصصة لصاحب التحويل فقط
    const navLinks = [
        { name: 'الرئيسية (رصيد المحفظة)', path: '/transfer-agent' },
        { name: 'إرسال تحويل جديد', path: '/transfer-agent/new' },
        { name: 'سجل التحويلات', path: '/transfer-agent/history' },
        { name: 'إعدادات المحفظة', path: '/transfer-agent/wallet-settings' },
        { name: 'ملفي الشخصي', path: '/transfer-agent/profile' }, // التبويب الجديد 👈
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
            {/* Overlay ... نفس الكود السابق */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar ... نفس الكود السابق */}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-emerald-800 text-white flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex items-center justify-between border-b border-emerald-700 shrink-0">
                    <span className="text-xl font-bold">بوابة التحويلات</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
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
                            className={`block px-4 py-2 rounded transition-colors ${location.pathname === link.path ? 'bg-emerald-600' : 'hover:bg-emerald-700'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </aside>
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header المحدث */}
                <header className="h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-gray-600 hover:bg-gray-100 rounded">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* عرض معلومات المستخدم */}
                        <div className="hidden sm:flex items-center gap-3">
                            {isLoading ? (
                                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                                <>
                                    {/* صورة المستخدم (إذا كانت null سيعرض أول حرف من اسمه كبديل) */}
                                    {userProfile?.profilePhoto ? (
                                        <img src={getSecureImageUrl(userProfile?.profilePhoto)} alt="Profile" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
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

                    <button onClick={handleLogoutClick} className={`group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${isConfirmingLogout ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                        <span>{isConfirmingLogout ? 'تأكيد الخروج؟' : 'تسجيل الخروج'}</span>
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

export default TransferAgentLayout;