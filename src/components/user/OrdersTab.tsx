// components/UserProfile/OrdersTab.tsx
import  { useState } from 'react';
import toast from 'react-hot-toast';
import { useAllOrders, useOrderItems, useCancelOrder } from '../../hooks/useOrder';
import ConfirmModal from '../templates/ConfirmModal';

export default function OrdersTab() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; orderId: number | null }>({ isOpen: false, orderId: null });

    const { data: orders, isLoading: ordersLoading } = useAllOrders();
    const { data: orderItems, isLoading: itemsLoading } = useOrderItems(selectedOrderId);
    const cancelOrderMutation = useCancelOrder();

    // التعامل مع شكل الاستجابة { data: [...], success: true }
    const safeOrders = Array.isArray(orders) ? orders : (orders as any)?.data || [];
    const safeOrderItems = Array.isArray(orderItems) ? orderItems : (orderItems as any)?.data || [];

    const handleConfirmCancel = () => {
        if (!modalInfo.orderId) return;
        cancelOrderMutation.mutate(modalInfo.orderId, {
            onSuccess: () => {
                toast.success('تم إلغاء الطلب بنجاح');
                setSelectedOrderId(null);
                setModalInfo({ isOpen: false, orderId: null });
            },
            onError: () => {
                toast.error('فشل إلغاء الطلب.');
                setModalInfo({ isOpen: false, orderId: null });
            }
        });
    };

    if (ordersLoading) return <p className="text-sm text-gray-500">جاري تحميل الطلبات... ⏳</p>;

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">سجل الطلبات وتتبعها</h2>
            {safeOrders.length > 0 ? (
                <div className="space-y-4">
                    {safeOrders.map((order: any) => (
                        <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-amber-200 transition-colors">
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                <div>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">رقم الطلب #{order.id}</span>
                                    {/* تعديل اسم الحقل إلى createdAt */}
                                    <p className="text-xs text-gray-400 mt-2">📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : 'غير متاح'}</p>
                                    <p className="text-xs text-gray-500 mt-1">📍 العنوان: {order.address}</p>
                                    <span className="text-xs text-gray-500 mt-1 block">📌 الحالة: <strong className={` ${order.status==='Cancelled'?'text-red-600':order.status==='Processing'?"text-amber-600":'text-green-600'}`}>{order.status == 'Cancelled'?"ملغي":order.status == 'Processing'?"قيد التنفيذ":"مكتمل"}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-sm text-gray-900">{order.totalPrice} ل.س</span>
                                    <button onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)} className="text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-bold">
                                        {selectedOrderId === order.id ? 'إخفاء التفاصيل' : 'عرض المحتويات'}
                                    </button>
                                    {order.status !== 'Cancelled' && order.status !== 'Canceled' && order.status !== 'ملغي' && (
                                        <button onClick={() => setModalInfo({ isOpen: true, orderId: order.id })} className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold">
                                            إلغاء الطلب
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* تفاصيل المنتجات داخل الطلب */}
                            {selectedOrderId === order.id && (
                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 bg-gray-50/50 p-3 rounded-xl">
                                    <h4 className="text-xs font-bold text-gray-700 mb-3">محتويات الشحنة:</h4>
                                    {itemsLoading ? <p className="text-xs text-gray-400">جاري جلب العناصر...</p> : safeOrderItems.length > 0 ? (
                                        <div className="space-y-3">
                                            {safeOrderItems.map((item: any, index: number) => (
                                                <div key={item.id || index} className="flex justify-between items-center text-xs bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                    
                                                    {/* بيانات الصورة والمنتج */}
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                                                                <img src={item.image} alt="Product" className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-bold text-gray-800 block mb-1">المنتج #{item.productId}</span>
                                                            <div className="flex flex-wrap items-center gap-3 text-gray-500">
                                                                <span>الكمية: <strong className="text-gray-700">{item.quantity}</strong></span>
                                                                {item.size && <span>المقاس: <strong className="text-gray-700">{item.size}</strong></span>}
                                                                {item.color && (
                                                                    <span className="flex items-center gap-1">
                                                                        اللون: {item.color}
                                                                        {item.colorHex && (
                                                                            <span className="w-3 h-3 rounded-full border border-gray-200 block shadow-inner" style={{ backgroundColor: item.colorHex }}></span>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* السعر */}
                                                    <span className="font-black text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        {item.price} ل.س
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-xs text-gray-400">لا توجد تفاصيل متاحة لهذا الطلب.</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-gray-500">ليس لديك أي طلبات سابقة حتى الآن.</p>}

            <ConfirmModal
                isOpen={modalInfo.isOpen}
                title="إلغاء الطلب"
                message="هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                isLoading={cancelOrderMutation.isPending}
                onConfirm={handleConfirmCancel}
                onClose={() => setModalInfo({ isOpen: false, orderId: null })}
            />
        </div>
    );
}