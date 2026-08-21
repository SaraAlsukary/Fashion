import { useState } from 'react';
import {
    useActiveUsers,
    useBannedUsers,
    useDeleteUser,
    useRevokeToken,
    useUnbanUser // 👈 1. تم إضافة الاستدعاء هنا
} from '../../hooks/useSuperAdmin'; 
import { getSecureImageUrl } from '../../constant/imageURL';

// دالة بسيطة لتنسيق التاريخ
const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

const UsersManagement = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'banned'>('active');

    const { data: activeUsers, isLoading: isLoadingActive } = useActiveUsers();
    const { data: bannedUsers, isLoading: isLoadingBanned } = useBannedUsers();

    const deleteUserMutation = useDeleteUser();
    const revokeTokenMutation = useRevokeToken();
    const unbanUserMutation = useUnbanUser(); // 👈 2. تهيئة الـ Hook الجديد

    const handleDelete = (userId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
            deleteUserMutation.mutate(userId);
        }
    };

    const handleBan = (userId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حظر هذا المستخدم (سحب صلاحية الدخول)؟')) {
            revokeTokenMutation.mutate(userId);
        }
    };

    // 👈 3. دالة جديدة للتعامل مع إلغاء الحظر
    const handleUnban = (userId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في إلغاء حظر هذا المستخدم وإعادة صلاحياته؟')) {
            unbanUserMutation.mutate(userId);
            // ملاحظة: لم نضف alert هنا لأن الـ Hook الخاص بك يحتوي بالفعل على toast.success
        }
    };

    const currentUsers = activeTab === 'active' ? activeUsers : bannedUsers;
    const isLoading = activeTab === 'active' ? isLoadingActive : isLoadingBanned;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة المستخدمين</h1>

            {/* نظام التبويبات (Tabs) */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`py-2 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'active'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    المستخدمين النشطين
                </button>
                <button
                    onClick={() => setActiveTab('banned')}
                    className={`py-2 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'banned'
                        ? 'border-b-2 border-red-600 text-red-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    المستخدمين المحظورين
                </button>
            </div>

            {/* جدول عرض المستخدمين */}
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                            <th className="py-3 px-4 font-semibold">المستخدم</th>
                            <th className="py-3 px-4 font-semibold">معلومات التواصل</th>
                            <th className="py-3 px-4 font-semibold">تفاصيل شخصية</th>
                            <th className="py-3 px-4 font-semibold">الحالة</th>
                            <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </td>
                            </tr>
                        ) : currentUsers && currentUsers.length > 0 ? (
                            currentUsers.map((user: any) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">

                                    {/* 1. الصورة، الاسم واسم المستخدم */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {user.profilePhoto ? (
                                                <img
                                                    src={getSecureImageUrl(user.profilePhoto)}
                                                    alt={user.firstName}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                                                    {user.firstName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                    @{user.userName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 2. الإيميل ورقم الهاتف */}
                                    <td className="py-4 px-4">
                                        <div className="text-sm text-gray-800">{user.email}</div>
                                        <div className="text-xs text-gray-500 mt-1" dir="ltr" style={{ textAlign: 'right' }}>
                                            {user.phoneNumber || 'لا يوجد رقم'}
                                        </div>
                                    </td>

                                    {/* 3. تاريخ الميلاد والجنس */}
                                    <td className="py-4 px-4">
                                        <div className="text-sm text-gray-800">
                                            {user.gender === 'Male' ? 'ذكر' : user.gender === 'Female' ? 'أنثى' : user.gender}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formatDate(user.birthDate)}
                                        </div>
                                    </td>

                                    {/* 4. الحالة */}
                                    <td className="py-4 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${activeTab === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {activeTab === 'active' ? 'نشط' : 'محظور'}
                                        </span>
                                    </td>

                                    {/* 5. الإجراءات */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            
                                            {/* زر الحظر يظهر فقط للمستخدمين النشطين */}
                                            {activeTab === 'active' && (
                                                <button
                                                    onClick={() => handleBan(user.id)}
                                                    disabled={revokeTokenMutation.isPending}
                                                    className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                    title="سحب التوكن (حظر مؤقت)"
                                                >
                                                    {revokeTokenMutation.isPending ? 'جاري...' : 'حظر'}
                                                </button>
                                            )}

                                            {/* 👈 4. زر إلغاء الحظر يظهر فقط للمستخدمين المحظورين */}
                                            {activeTab === 'banned' && (
                                                <button
                                                    onClick={() => handleUnban(user.id)}
                                                    disabled={unbanUserMutation.isPending}
                                                    className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                    title="إلغاء حظر المستخدم"
                                                >
                                                    {unbanUserMutation.isPending ? 'جاري...' : 'إلغاء حظر'}
                                                </button>
                                            )}

                                            {/* زر الحذف يظهر في كلا التبويبين */}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deleteUserMutation.isPending}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {deleteUserMutation.isPending ? 'جاري...' : 'حذف'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-500">
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    لا يوجد مستخدمين لعرضهم في هذه القائمة.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManagement;