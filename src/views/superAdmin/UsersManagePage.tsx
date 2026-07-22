// src/views/SuperAdmin/UsersManagePage.tsx
import { useRevokeToken } from '../../hooks/useSuperAdmin';

const UsersManagePage = () => {
    const revokeTokenMutation = useRevokeToken();

    // بيانات وهمية للتجربة (يجب استبدالها لاحقاً بـ useQuery لجلب المستخدمين)
    const mockUsers = [
        { id: 'user-123', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'StoreOwner', status: 'Active' },
        { id: 'user-456', name: 'خالد عبدالله', email: 'khaled@example.com', role: 'Customer', status: 'Active' },
        { id: 'user-789', name: 'سارة أحمد', email: 'sara@example.com', role: 'Admin', status: 'Active' },
    ];

    const handleRevokeToken = (userId: string, userName: string) => {
        if(window.confirm(`هل أنت متأكد من سحب صلاحية الدخول (Token) للمستخدم ${userName}؟ سيتم تسجيل خروجه إجبارياً.`)) {
            revokeTokenMutation.mutate(userId, {
                onSuccess: () => alert(`تم سحب صلاحيات ${userName} بنجاح!`)
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">إدارة المستخدمين والأمان</h1>
            
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600">
                            <th className="p-4 border-b font-medium">الاسم</th>
                            <th className="p-4 border-b font-medium">البريد الإلكتروني</th>
                            <th className="p-4 border-b font-medium">الدور</th>
                            <th className="p-4 border-b font-medium">الحالة</th>
                            <th className="p-4 border-b font-medium text-center">إجراءات الأمان</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 border-b font-medium text-gray-800">{user.name}</td>
                                <td className="p-4 border-b text-gray-600">{user.email}</td>
                                <td className="p-4 border-b text-gray-600">{user.role}</td>
                                <td className="p-4 border-b">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 border-b text-center">
                                    <button 
                                        onClick={() => handleRevokeToken(user.id, user.name)}
                                        className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-md text-sm transition disabled:opacity-50 font-medium"
                                        disabled={revokeTokenMutation.isPending && revokeTokenMutation.variables === user.id}
                                    >
                                        {(revokeTokenMutation.isPending && revokeTokenMutation.variables === user.id) 
                                            ? 'جاري السحب...' 
                                            : 'سحب التوكن (Revoke)'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManagePage;