import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

// تعريف واجهة بيانات الطلب (تعدل حسب شكل البيانات القادمة من السيرفر)
interface Order {
    id: string;
    orderDate: string;
    totalPrice: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
}

export default function Profile() {
    // 1️⃣ جلب بيانات المستخدم الحالي من الـ Context
    const { user } = useContext(AuthContext);

    // 2️⃣ جلب طلبات المستخدم باستخدام React Query
    const { data: orders, isLoading, isError } = useQuery<Order[]>({
        queryKey: ['userOrders', user?.id], // مفتاح فريد لـ التخزين المؤقت (Caching)
        queryFn: async () => {
            // قم بتغيير المسار بناءً على الـ Endpoint الخاص بك في السيرفر
            const { data } = await api.get('/Orders/MyOrders');
            return data.data; // نفترض أن البيانات تعود داخل كائن data
        },
        enabled: !!user, // لا يتم تشغيل الطلب إلا إذا كان المستخدم مسجلاً بالفعل
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl font-semibold text-gray-600 animate-pulse">جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (isError) {
        toast.error("حدث خطأ أثناء تحميل الطلبات");
        return (
            <div className="text-center p-8 text-red-500">
                حدث خطأ في تحميل بيانات الملف الشخصي. يرجى المحاولة لاحقاً.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">

            {/* القسم الأول: بطاقة بيانات المستخدم */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">الملف الشخصي</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-400">الاسم الكامل</span>
                        <span className="text-lg font-medium text-gray-700">{user?.name || 'مستخدم'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-400">البريد الإلكتروني</span>
                        <span className="text-lg font-medium text-gray-700">{user?.email || 'لا يوجد بريد إلكتروني'}</span>
                    </div>
                    <div className="flex flex-col space-y-1 md:col-span-2">
                        <span className="text-sm text-gray-400">الصلاحيات الأدوار</span>
                        <div className="flex gap-2 mt-1">
                            {user?.roles?.map((role: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                    {role}
                                </span>
                            )) || <span className="text-gray-500 text-sm">مستخدم عادي</span>}
                        </div>
                    </div>
                </div>
            </section>

            {/* القسم الثاني: قائمة طلبات المستخدم */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">طلباتي السابقة</h2>

                {!orders || orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">لم تقم بأي طلبات حتى الآن.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                                    <th className="p-4 font-semibold">رقم الطلب</th>
                                    <th className="p-4 font-semibold">التاريخ</th>
                                    <th className="p-4 font-semibold">الإجمالي</th>
                                    <th className="p-4 font-semibold">حالة الطلب</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-blue-600">#{order.id.substring(0, 8)}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4 font-semibold">{order.totalPrice} ر.س</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                                    order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                                        'bg-red-50 text-red-600'
                                                }`}>
                                                {order.status === 'Completed' && 'مكتمل'}
                                                {order.status === 'Pending' && 'قيد الانتظار'}
                                                {order.status === 'Cancelled' && 'ملغي'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </div>
    );
}