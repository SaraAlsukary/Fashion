// pages/UserProfileDashboard.tsx (أو حسب مسارك)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileTab from '../../components/user/ProfileTab';
import OrdersTab from '../../components/user/OrdersTab';
import WalletTab from '../../components/user/WalletTab';
import StoreRequestsTab from '../../components/user/StoreRequestsTab';

export default function UserProfileDashboard() {
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wallet' | 'storeRequests'>('profile');
    const navigate = useNavigate();
    const roleNames = JSON.parse(localStorage.getItem('roleNames') || '[]');

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50/50" dir="rtl">
            <h1 className="text-2xl font-black text-gray-900 mb-6">لوحة التحكم الخاصة بي</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* القائمة الجانبية (Sidebar) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'profile' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        👤 الحساب والصورة الشخصية
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📦 طلباتي ومشترياتي
                    </button>
                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'wallet' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        💰 محفظتي الإلكترونية
                    </button>
                    <button
                        onClick={() => setActiveTab('storeRequests')}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'storeRequests' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        🏪 طلبات فتح متجر
                    </button>

                    {roleNames && roleNames.includes('Admin') && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 mt-4 w-full rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            🏪 لوحة تحكم الإدارة
                        </button>
                    )}
                </div>

                {/* منطقة المحتوى الديناميكية */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'wallet' && <WalletTab />}
                    {activeTab === 'storeRequests' && <StoreRequestsTab />}
                </div>
            </div>
        </div>
    );
}