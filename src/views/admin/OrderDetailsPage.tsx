import React, { useState } from 'react';
import { useGetOrdersDetail } from '../../hooks/useAdmin'; // تأكد من مسار الاستيراد الصحيح

const OrderDetailsPage = () => {
    // حالات تخزين التواريخ
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // استدعاء الـ Hook وجلب البيانات بناءً على التواريخ المحددة
    const { data, isLoading, isError } = useGetOrdersDetail(
        startDate || undefined,
        endDate || undefined
    );
    
    // استخراج مصفوفة المنتجات/التفاصيل من الاستجابة
    const items = data?.data || [];

    // دالة لمسح الفلاتر
    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md min-h-screen" dir="rtl">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">تفاصيل مبيعات المنتجات</h1>

            {/* شريط أدوات الفلترة بالتاريخ */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap items-end gap-4 shadow-sm">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">من تاريخ:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">إلى تاريخ:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {(startDate || endDate) && (
                    <button
                        onClick={handleClearFilters}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md border border-red-200 font-medium transition-colors"
                    >
                        مسح الفلاتر ✖
                    </button>
                )}
            </div>

            {/* عرض حالة التحميل والخطأ والبيانات */}
            {isLoading ? (
                <div className="text-center py-12 text-blue-600 font-semibold animate-pulse">
                    جاري جلب التفاصيل...
                </div>
            ) : isError ? (
                <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-100">
                    حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                    لا توجد بيانات مطابقة للتواريخ المحددة.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-4 border-b font-bold">رقم المنتج</th>
                                <th className="p-4 border-b font-bold">السعر</th>
                                <th className="p-4 border-b font-bold">عدد المبيعات</th>
                                <th className="p-4 border-b font-bold">الكمية المتبقية</th>
                                <th className="p-4 border-b font-bold">المقاس</th>
                                <th className="p-4 border-b font-bold">اللون</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors border-b last:border-0">
                                    <td className="p-4 font-semibold text-gray-900">#{item.productId}</td>
                                    <td className="p-4 font-black text-green-600">${item.price}</td>
                                    
                                    <td className="p-4 text-gray-800">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                            {item.numberOfSales}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4 text-gray-800">
                                        <span className={`${item.remainingQuantity < 5 ? 'text-red-600 font-bold' : ''}`}>
                                            {item.remainingQuantity}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4 text-gray-600 font-medium">{item.size || 'غير متوفر'}</td>
                                    
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">{item.color}</span>
                                            {item.colorHexCode && (
                                                <span 
                                                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm block" 
                                                    style={{ backgroundColor: item.colorHexCode }}
                                                    title={item.color}
                                                ></span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;