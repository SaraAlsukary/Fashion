import { useState } from 'react';
import { useAllOrders, useCancelOrder, useOrderItems } from '../../hooks/useOrder';
// تمت إضافة useUserProfile هنا لجلب بيانات المستخدم
import { useUpdateProfilePhoto, useUserProfile } from '../../hooks/useUser';
import { useWallet } from '../../hooks/useWallet';
import { useAllTransactions } from '../../hooks/useTransaction';
// 👇 تمت إضافة هوكس المتاجر
import { useGetAllRequestStoreByUser, useStore } from '../../hooks/useStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function UserProfileDashboard() {
    // 👇 تمت إضافة 'storeRequests'
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wallet' | 'storeRequests'>('profile');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const navigate = useNavigate()
    const roleNames = JSON.parse(localStorage.getItem('roleNames')!);

    // استدعاء الهوكس
    // ---------------------------------
    // تمت إضافة هذا الهوك لجلب بيانات اليوزر
    const { data: userProfile, isLoading: userLoading } = useUserProfile();
    // ---------------------------------

    const { data: orders, isLoading: ordersLoading } = useAllOrders();
    const { data: orderItems, isLoading: itemsLoading } = useOrderItems(selectedOrderId);
    const cancelOrderMutation = useCancelOrder();
    const updatePhotoMutation = useUpdateProfilePhoto();

    const { data: wallet, isLoading: walletLoading } = useWallet();
    const { data: transactions } = useAllTransactions();

    // ---------------------------------
    // 👇 هوكس طلبات المتاجر
    // ---------------------------------
    const { data: storeRequestsRes, isLoading: requestsLoading } = useGetAllRequestStoreByUser();
    const { cancelStoreRequest, isCancelingRequest } = useStore();
    const storeRequests = storeRequestsRes?.data || [];

    // معالجة رفع الصورة الشخصية
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            toast.promise(
                updatePhotoMutation.mutateAsync(file),
                {
                    loading: 'جاري رفع وتحديث الصورة... ⏳',
                    success: 'تم تحديث صورتك الشخصية بنجاح! 🎉',
                    error: 'حدث خطأ أثناء رفع الصورة.',
                }
            );
        }
    };

    // معالجة إلغاء الطلب
    const handleCancelOrder = (orderId: number) => {
        if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) {
            cancelOrderMutation.mutate(orderId, {
                onSuccess: () => {
                    toast.success('تم إلغاء الطلب بنجاح');
                    setSelectedOrderId(null);
                },
                onError: () => toast.error('فشل إلغاء الطلب.')
            });
        }
    };

    // 👇 معالجة إلغاء طلب فتح المتجر
    const handleCancelStoreRequest = (requestId: number) => {
        if (confirm('هل أنت متأكد من رغبتك في التراجع وإلغاء طلب فتح المتجر؟')) {
            cancelStoreRequest(requestId);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50/50" dir="rtl">
            <h1 className="text-2xl font-black text-gray-900 mb-6">لوحة التحكم الخاصة بي</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* القائمة الجانبية للتنقل (Sidebar Tabs) */}
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
                    {/* 👇 التبويب الجديد */}
                    <button
                        onClick={() => setActiveTab('storeRequests')}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'storeRequests' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        🏪 طلبات فتح متجر
                    </button>
                    {/* سيظهر هذا الزر فقط إذا كان المستخدم يمتلك صلاحية 'StoreOwner' */}
                    {roleNames && roleNames.includes('Admin') && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            🏪 لوحة تحكم المتجر
                        </button>
                    )}
                </div>

                {/* منطقة المحتوى الديناميكية */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

                    {/* 1️⃣ تبويب الملف الشخصي وتحديث الصورة */}
                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">إعدادات الحساب</h2>

                            {userLoading ? (
                                <p className="text-sm text-gray-500">جاري تحميل بيانات الحساب... ⏳</p>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-amber-400 shadow-inner flex-shrink-0">
                                        <img
                                            // ربط صورة المستخدم القادمة من الهوك، وإذا لم توجد نستخدم التخزين المحلي كبديل
                                            src={`http://www.marketexpress.somee.com/${userProfile?.profilePhoto}` || localStorage.getItem('userPhoto') || "https://via.placeholder.com/150"}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1">
                                            تعديل الصورة
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="text-center sm:text-right flex-1">
                                        {/* عرض بيانات المستخدم القادمة من الهوك هنا */}
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                                            {userProfile?.firstName ? `مرحباً بك، ${userProfile.firstName + ' ' + userProfile.lastName}` : 'مرحباً بك في لوحتك الخاصة'}
                                        </h3>
                                        <div className="space-y-1 mb-3">
                                            {userProfile?.email && (
                                                <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                                    ✉️ {userProfile.email}
                                                </p>
                                            )}
                                            {userProfile?.phoneNumber && (
                                                <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                                    📱 {userProfile.phoneNumber}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 bg-white inline-block px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                            💡 يمكنك الضغط على الصورة مباشرة لتحميل صورة ملف شخصي جديدة.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2️⃣ تبويب إدارة الطلبات وعناصرها */}
                    {activeTab === 'orders' && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">سجل الطلبات وتتبعها</h2>
                            {ordersLoading ? (
                                <p className="text-sm text-gray-500">جاري تحميل الطلبات... ⏳</p>
                            ) : orders && orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-amber-200 transition-colors">
                                            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                                <div>
                                                    <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">رقم الطلب #{order.id}</span>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(order.orderDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-sm text-gray-900">{order.totalPrice} ريال</span>
                                                    <button
                                                        onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                                                        className="text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-bold"
                                                    >
                                                        {selectedOrderId === order.id ? 'إخفاء التفاصيل' : 'عرض المحتويات'}
                                                    </button>
                                                    {order.status !== 'Cancelled' && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold"
                                                        >
                                                            إلغاء الطلب
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* عرض عناصر الطلب الفرعية عند الضغط */}
                                            {selectedOrderId === order.id && (
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-100 bg-gray-50/50 p-3 rounded-xl">
                                                    <h4 className="text-xs font-bold text-gray-700 mb-2">محتويات الشحنة:</h4>
                                                    {itemsLoading ? (
                                                        <p className="text-xs text-gray-400">جاري جلب العناصر...</p>
                                                    ) : orderItems && orderItems.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {orderItems.map((item) => (
                                                                <div key={item.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-gray-100">
                                                                    <span className="font-semibold text-gray-800">{item.productName} (عدد: {item.quantity})</span>
                                                                    <span className="font-bold text-gray-600">{item.price} ريال</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400">لا توجد تفاصيل متاحة لهذا الطلب.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">ليس لديك أي طلبات سابقة حتى الآن.</p>
                            )}
                        </div>
                    )}

                    {/* 3️⃣ تبويب المحفظة والعمليات السابقة */}
                    {activeTab === 'wallet' && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">الرصيد المالي والعمليات</h2>
                            {walletLoading ? (
                                <p className="text-sm text-gray-500">جاري فحص المحفظة...</p>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl text-white shadow-sm">
                                        <p className="text-xs opacity-90 font-medium">الرصيد المتاح حالياً</p>
                                        <p className="text-3xl font-black mt-1">{wallet?.balance ?? 0} <span className="text-lg">ليرة سورية</span></p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">آخر التحركات المالية:</h3>
                                        {transactions && transactions.length > 0 ? (
                                            <div className="divide-y divide-gray-100">
                                                {transactions.map((tx: any) => (
                                                    <div key={tx.id} className="py-3 flex justify-between items-center text-sm">
                                                        <div>
                                                            <p className="font-bold text-gray-800">{tx.description || tx.transactionType}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{tx.date ? new Date(tx.date).toLocaleDateString('ar-EG') : ''}</p>
                                                        </div>
                                                        <span className="font-extrabold text-amber-600" dir="ltr">+{tx.amount} ر.س</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400">لا توجد حركات مالية مسجلة بعد.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4️⃣ التبويب الجديد: طلبات الإنضمام كتاجر 👇 */}
                    {activeTab === 'storeRequests' && (
                        <div>
                            {/* 👇 هنا تمت إضافة الزر الذي طلبته */}
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                                <h2 className="text-lg font-bold text-gray-900">طلبات الانضمام كصاحب متجر</h2>
                                <button
                                    onClick={() => {
                                        // يمكنك هنا إضافة الدالة التي تفتح المودال (النافذة المنبثقة) أو توجه المستخدم لصفحة الطلب
                                        console.log('فتح نافذة تقديم طلب متجر جديد...');
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                                >
                                    ➕ تقديم طلب جديد
                                </button>
                            </div>

                            {requestsLoading ? (
                                <p className="text-sm text-gray-500">جاري تحميل الطلبات... ⏳</p>
                            ) : storeRequests && storeRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {storeRequests.map((req: any) => (
                                        <div key={req.id} className="border border-gray-100 rounded-xl p-4 hover:border-amber-200 transition-colors bg-white">
                                            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                                <div>
                                                    <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                                        طلب رقم #{req.id}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString('ar-EG') : 'تاريخ غير متاح'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* حالة الطلب */}
                                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${req.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                                            req.status === 'Approved' ? 'bg-green-50 text-green-600' :
                                                                req.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {req.status === 'Pending' ? 'قيد الانتظار' :
                                                            req.status === 'Approved' ? 'تمت الموافقة ✅' :
                                                                req.status === 'Rejected' ? 'مرفوض ❌' :
                                                                    req.status === 'Cancelled' ? 'ملغي' : req.status}
                                                    </span>

                                                    {/* زر الإلغاء يظهر فقط في حالة قيد الانتظار */}
                                                    {req.status === 'Pending' && (
                                                        <button
                                                            onClick={() => handleCancelStoreRequest(req.id)}
                                                            disabled={isCancelingRequest}
                                                            className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
                                                        >
                                                            {isCancelingRequest ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm flex flex-col gap-1">
                                                <p className="text-gray-700 font-bold">
                                                    اسم المتجر: <span className="font-normal text-amber-600">{req.storeName || 'غير متوفر'}</span>
                                                </p>
                                                {req.description && (
                                                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                                                        <span className="font-bold">الوصف:</span> {req.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                                    <p className="text-sm text-gray-500">ليس لديك أي طلبات انضمام كتاجر حتى الآن.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}