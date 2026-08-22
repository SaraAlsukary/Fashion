import React, { useState } from 'react';
import { useFilterOrders } from '../../hooks/useSuperAdmin';
import { useUpdateOrderStatus, useOrderItems } from '../../hooks/useOrder';
import { getSecureImageUrl } from '../../constant/imageURL';

// كائن لترجمة الحالات من الإنجليزية إلى العربية
const statusTranslations: Record<string, string> = {
  Processing: 'قيد التنفيذ',
  Cancelled: 'ملغى',
  Delivered: 'تم التسليم'
};

const OrdersTab = () => {
  // حالة الفلتر الحالي
  const [selectedFilter, setSelectedFilter] = useState<'Processing' | 'Cancelled' | 'Delivered' | ''>('Processing');
  
  // حالة الطلب المحدد لعرض تفاصيله
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  // إعدادات الصفحة
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // 1️⃣ بناء معاملات الـ API بشكل ديناميكي (إذا كان الكل، نحذف orderStatus تماماً من الطلب)
  const queryParams: any = {
    pageNumber,
    pageSize
  };
  
  if (selectedFilter !== '') {
    queryParams.orderStatus = selectedFilter;
    // ملاحظة: إذا كان الباك إند يشترط إرسال null بدلاً من حذفه، يمكنك استخدام:
    // queryParams.orderStatus = selectedFilter === '' ? null : selectedFilter;
  }

  // جلب الطلبات بناءً على الفلتر
  const { data: orders, isLoading, isError } = useFilterOrders(queryParams);

  // جلب تفاصيل ومنتجات الطلب المحدد
  const { data: orderItems, isLoading: itemsLoading } = useOrderItems(selectedOrderId);

  // Hook تحديث الحالة
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  // 2️⃣ استخراج مصفوفة الطلبات بشكل آمن (لمنع الأخطاء إذا اختلفت استجابة الـ API عند طلب "الكل")
  const safeOrders = Array.isArray(orders) 
    ? orders 
    : (orders as any)?.data || (orders as any)?.items || [];

  // تجهيز مصفوفة تفاصيل المنتجات بشكل آمن
  const safeOrderItems = Array.isArray(orderItems)
    ? orderItems
    : (orderItems as any)?.data || (orderItems as any)?.items || [];

  // دالة التعامل مع تغيير حالة الطلب
  const handleStatusChange = (orderId: number, newStatus: 'Processing' | 'Cancelled' | 'Delivered') => {
    updateStatus({ orderId, status: newStatus });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">إدارة الطلبات</h2>

      {/* قسم الفلترة */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold text-gray-700">تصفية حسب الحالة:</label>
        <select
          className="border border-gray-300 rounded-md p-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedFilter}
          onChange={(e) => {
            setSelectedFilter(e.target.value as any);
            setPageNumber(1); // إعادة الصفحة إلى 1 عند تغيير الفلتر
          }}
        >
          <option value="Processing">{statusTranslations['Processing']}</option>
          <option value="Delivered">{statusTranslations['Delivered']}</option>
          <option value="Cancelled">{statusTranslations['Cancelled']}</option>
        </select>
      </div>

      {/* عرض البيانات */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">جاري تحميل الطلبات...</div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">حدث خطأ أثناء جلب البيانات.</div>
      ) : safeOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">لا توجد طلبات مطابقة للبحث.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 p-3 text-right">رقم الطلب</th>
                <th className="border border-gray-200 p-3 text-right">الاسم</th>
                <th className="border border-gray-200 p-3 text-right">رقم الهاتف</th>
                <th className="border border-gray-200 p-3 text-right">العنوان</th>
                <th className="border border-gray-200 p-3 text-right">تاريخ الطلب</th>
                <th className="border border-gray-200 p-3 text-right">الإجمالي</th>
                <th className="border border-gray-200 p-3 text-right">الحالة الحالية</th>
                <th className="border border-gray-200 p-3 text-center">الإجراءات وتغيير الحالة</th>
              </tr>
            </thead>
            <tbody>
              {safeOrders.map((order: any) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 font-bold">#{order.id}</td>
                    <td className="border border-gray-200 p-3 font-bold">{order.fullName}</td>
                    <td className="border border-gray-200 p-3 font-bold">{order.phoneNumber}</td>
                    <td className="border border-gray-200 p-3 font-bold">{order.address}</td>
                    <td className="border border-gray-200 p-3">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : 'غير متوفر'}
                    </td>
                    <td className="border border-gray-200 p-3 font-black">${order.totalPrice}</td>
                    
                    {/* عرض الحالة الحالية بالعربية */}
                    <td className="border border-gray-200 p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {statusTranslations[order.status] || order.status}
                      </span>
                    </td>

                    {/* قائمة تغيير الحالة + زر عرض التفاصيل */}
                    <td className="border border-gray-200 p-3 text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <select
                          className="border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                          disabled={isUpdating}
                        >
                          <option value="Processing">{statusTranslations['Processing']}</option>
                          <option value="Delivered">{statusTranslations['Delivered']}</option>
                          <option value="Cancelled">{statusTranslations['Cancelled']}</option>
                        </select>

                        <button
                          onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                          className="text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-md font-bold transition-colors"
                        >
                          {selectedOrderId === order.id ? 'إخفاء التفاصيل' : 'عرض المحتويات'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 🟢 صف تفاصيل المنتجات المنسدل (يمتد على عرض الجدول بالكامل باستخدام colSpan) 🟢 */}
                  {selectedOrderId === order.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={8} className="border border-gray-200 p-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <h4 className="text-xs font-bold text-gray-700 mb-3">محتويات الشحنة للطلب #{order.id}:</h4>
                          {itemsLoading ? (
                            <p className="text-xs text-gray-400 py-3 text-center">جاري جلب عناصر الطلب...</p>
                          ) : safeOrderItems.length > 0 ? (
                            <div className="space-y-3">
                              {safeOrderItems.map((item: any, index: number) => (
                                <div key={item.id || index} className="flex justify-between items-center text-xs bg-gray-50/80 p-3 rounded-lg border border-gray-200 shadow-sm">
                                  
                                  {/* بيانات الصورة والمنتج */}
                                  <div className="flex items-center gap-3">
                                    {(item.image || item.Image) && (
                                      <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                                        <img src={getSecureImageUrl(item.image || item.Image)} alt="Product" className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-bold text-gray-800 block mb-1">المنتج #{item.productId || item.ProductId}</span>
                                      <div className="flex flex-wrap items-center gap-3 text-gray-500">
                                        <span>الكمية: <strong className="text-gray-700">{item.quantity || item.Quantity}</strong></span>
                                        {(item.size || item.Size) && <span>المقاس: <strong className="text-gray-700">{item.size || item.Size}</strong></span>}
                                        {(item.color || item.Color) && (
                                          <span className="flex items-center gap-1">
                                            اللون: {item.color || item.Color}
                                            {(item.colorHex || item.ColorHex) && (
                                              <span className="w-3 h-3 rounded-full border border-gray-200 block shadow-inner" style={{ backgroundColor: item.colorHex || item.ColorHex }}></span>
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* السعر */}
                                  <span className="font-black text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    {item.price || item.Price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 py-3 text-center">لا توجد تفاصيل متاحة لهذا الطلب.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* قسم التصفح (Pagination) */}
      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          السابق
        </button>
        
        <span className="text-gray-600 font-medium">
          الصفحة {pageNumber}
        </span>
        
        <button
          onClick={() => setPageNumber((prev) => prev + 1)}
          disabled={safeOrders.length < pageSize} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default OrdersTab;