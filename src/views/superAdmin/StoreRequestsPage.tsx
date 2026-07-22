import { useState } from 'react';
import { useRequestStores, useApproveRequest, useRejectRequest } from '../../hooks/useSuperAdmin';

const StoreRequestsPage = () => {
    const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
    
    // حالة للتحكم في النافذة المنبثقة (Modal) والطلب المحدد
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const { data: requests, isLoading } = useRequestStores({
        storeStatus: statusFilter,
        pageNumber: 1,
        pageSize: 10
    });

    const approveMutation = useApproveRequest();
    const rejectMutation = useRejectRequest();

    const handleApprove = (id: number) => {
        if(window.confirm('هل أنت متأكد من قبول هذا المتجر؟')) {
            approveMutation.mutate(id);
            if (selectedRequest?.id === id) setSelectedRequest(null); // إغلاق المودال إذا كان مفتوحاً
        }
    };

    const handleReject = (id: number) => {
        const reason = window.prompt('يرجى إدخال سبب الرفض (اختياري):');
        if(reason !== null) {
            rejectMutation.mutate({ requestId: id, reason });
            if (selectedRequest?.id === id) setSelectedRequest(null); // إغلاق المودال إذا كان مفتوحاً
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6 relative">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">إدارة طلبات المتاجر</h1>
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Pending">قيد الانتظار</option>
                    <option value="Approved">مقبولة</option>
                    <option value="Rejected">مرفوضة</option>
                </select>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">جاري تحميل الطلبات...</div>
            ) : requests?.length === 0 ? (
                <div className="text-center py-10 text-gray-500">لا توجد طلبات {statusFilter} حالياً.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600">
                                <th className="p-4 border-b font-medium">رقم الطلب</th>
                                <th className="p-4 border-b font-medium">اسم المتجر</th>
                                <th className="p-4 border-b font-medium">الوصف</th>
                                <th className="p-4 border-b font-medium">العنوان</th>
                                <th className="p-4 border-b font-medium">البريد الإلكتروني</th>
                                <th className="p-4 border-b font-medium">الشعار</th>
                                <th className="p-4 border-b font-medium">صورة الغلاف</th>
                                <th className="p-4 border-b font-medium">الحالة</th>
                                <th className="p-4 border-b font-medium">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests?.map((req: any) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 border-b">{req.id}</td>
                                    <td className="p-4 border-b font-medium text-gray-800">{req.storeName || 'متجر غير مسمى'}</td>
                                    <td className="p-4 border-b font-medium text-gray-800">{req.description || 'لا يوجد وصف'}</td>
                                    <td className="p-4 border-b font-medium text-gray-800">{req.address || 'لا يوجد عنوان'}</td>
                                    <td className="p-4 border-b font-medium text-gray-800">{req.email || 'لا يوجد بريد'}</td>
                                    <td className="p-4 border-b">
                                        <img src={req.logo ? `http://www.marketexpress.somee.com/${req.logo}` : '/default-store-logo.png'} alt="Logo" className="w-16 h-16 object-cover rounded-md" />
                                    </td>
                                    <td className="p-4 border-b">
                                        <img src={req.featuredImage ? `http://www.marketexpress.somee.com/${req.featuredImage}` : '/default-store-image.png'} alt="Featured" className="w-16 h-16 object-cover rounded-md" />
                                    </td>
                                    <td className="p-4 border-b">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            statusFilter === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            statusFilter === 'Approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {statusFilter === 'Pending' ? 'قيد الانتظار' : statusFilter === 'Approved' ? 'مقبول' : 'مرفوض'}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b space-x-2 space-x-reverse">
                                        {/* زر العرض */}
                                        <button 
                                            onClick={() => setSelectedRequest(req)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
                                        >
                                            عرض
                                        </button>

                                        {statusFilter === 'Pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(req.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm transition disabled:opacity-50"
                                                    disabled={approveMutation.isPending}
                                                >
                                                    {approveMutation.isPending ? 'جاري القبول...' : 'قبول'}
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(req.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition disabled:opacity-50"
                                                    disabled={rejectMutation.isPending}
                                                >
                                                    {rejectMutation.isPending ? 'جاري الرفض...' : 'رفض'}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* النافذة المنبثقة (Modal) لعرض التفاصيل */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">تفاصيل طلب المتجر #{selectedRequest.id}</h2>
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 text-right">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">اسم المتجر</p>
                                    <p className="font-medium text-gray-800">{selectedRequest.storeName || 'غير متوفر'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                                    <p className="font-medium text-gray-800">{selectedRequest.email || 'غير متوفر'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">العنوان</p>
                                    <p className="font-medium text-gray-800">{selectedRequest.address || 'غير متوفر'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">حالة الطلب</p>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        statusFilter === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        statusFilter === 'Approved' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {statusFilter}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">الوصف</p>
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-md border">{selectedRequest.description || 'لا يوجد وصف'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">شعار المتجر</p>
                                    <img src={selectedRequest.logo ? `http://www.marketexpress.somee.com/${selectedRequest.logo}` : '/default-store-logo.png'} alt="Logo" className="w-full h-32 object-contain bg-gray-50 border rounded-md" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">صورة الغلاف</p>
                                    <img src={selectedRequest.featuredImage ? `http://www.marketexpress.somee.com/${selectedRequest.featuredImage}` : '/default-store-image.png'} alt="Featured" className="w-full h-32 object-cover bg-gray-50 border rounded-md" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex justify-end space-x-2 space-x-reverse bg-gray-50">
                            {statusFilter === 'Pending' && (
                                <>
                                    <button 
                                        onClick={() => handleApprove(selectedRequest.id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition"
                                    >
                                        قبول المتجر
                                    </button>
                                    <button 
                                        onClick={() => handleReject(selectedRequest.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition"
                                    >
                                        رفض المتجر
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md transition"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreRequestsPage;