import { useState } from 'react';
import { 
    useRequestStores, 
    useApproveRequest, 
    useRejectRequest, 
    useStoreFiles 
} from '../../hooks/useSuperAdmin'; // أضفنا useStoreFiles
import { useStore } from '../../hooks/useStore';
import { getSecureImageUrl } from '../../constant/imageURL';

const StoreRequestsPage = () => {
    const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

    // حالة للتحكم في النافذة المنبثقة (Modal) والطلب المحدد
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    // جلب طلبات المتاجر الرئيسية
    const { data: requests, isLoading } = useRequestStores({
        storeStatus: statusFilter,
        pageNumber: 1,
        pageSize: 10
    });

    // جلب ملفات المتجر المحدد منفصلاً باستخدام id الطلب المختار
    const { data: storeFiles, isLoading: isLoadingFiles } = useStoreFiles(selectedRequest?.id);

    const approveMutation = useApproveRequest();
    const rejectMutation = useRejectRequest();
    const { deleteStore, isDeletingStore } = useStore();

    const handleApprove = (id: number) => {
        if (window.confirm('هل أنت متأكد من قبول هذا المتجر؟')) {
            approveMutation.mutate(id);
            if (selectedRequest?.id === id) setSelectedRequest(null);
        }
    };

    const handleReject = (id: number) => {
        const reason = window.prompt('يرجى إدخال سبب الرفض (اختياري):');
        if (reason !== null) {
            rejectMutation.mutate({ requestId: id, reason });
            if (selectedRequest?.id === id) setSelectedRequest(null);
        }
    };

    const handleDelete = (storeId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المتجر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
            deleteStore(storeId);
            if (selectedRequest?.id === storeId) setSelectedRequest(null);
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
                                        <img src={getSecureImageUrl(req.logo)} alt="Logo" className="w-16 h-16 object-cover rounded-md" />
                                    </td>
                                    <td className="p-4 border-b">
                                        <img src={getSecureImageUrl(req.featuredImage)} alt="Featured" className="w-16 h-16 object-cover rounded-md" />
                                    </td>
                                    <td className="p-4 border-b">
                                        <span className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                statusFilter === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {statusFilter === 'Pending' ? 'قيد الانتظار' : statusFilter === 'Approved' ? 'مقبول' : 'مرفوض'}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b space-x-2 space-x-reverse min-w-[200px]">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
                                        >
                                            عرض
                                        </button>

                                        {statusFilter === 'Pending' ? (
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
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                className="bg-red-600 mx-3 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition disabled:opacity-50"
                                                disabled={isDeletingStore}
                                            >
                                                {isDeletingStore ? 'جاري الحذف...' : 'حذف'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* النافذة المنبثقة (Modal) لعرض التفاصيل والملفات */}
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
                                    <span className={`px-2 py-1 rounded text-xs ${statusFilter === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
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
                                    <img src={getSecureImageUrl(selectedRequest.logo)} alt="Logo" className="w-full h-32 object-contain bg-gray-50 border rounded-md" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">صورة الغلاف</p>
                                    <img src={getSecureImageUrl(selectedRequest.featuredImage)} alt="Featured" className="w-full h-32 object-cover bg-gray-50 border rounded-md" />
                                </div>
                            </div>

                            {/* ====== قسم جلب وعرض الملفات والمستندات المرفقة ====== */}
                            <div className="pt-4 border-t mt-4">
                                <p className="text-sm text-gray-500 mb-3 font-bold">الملفات والمستندات الرسمية</p>
                                
                                {isLoadingFiles ? (
                                    <div className="text-center py-4 text-gray-500 text-sm">جاري تحميل الملفات...</div>
                                ) : storeFiles && (storeFiles.nationalIdFrontImage || storeFiles.nationalIdBackImage || storeFiles.storeLicenseImage) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {storeFiles.nationalIdFrontImage && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">الهوية الوطنية (أمامي)</p>
                                                <a href={getSecureImageUrl(storeFiles.nationalIdFrontImage)} target="_blank" rel="noreferrer">
                                                    <img src={getSecureImageUrl(storeFiles.nationalIdFrontImage)} alt="National ID Front" className="w-full h-32 object-cover bg-gray-50 border rounded-md hover:opacity-80 transition cursor-pointer" />
                                                </a>
                                            </div>
                                        )}
                                        {storeFiles.nationalIdBackImage && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">الهوية الوطنية (خلفي)</p>
                                                <a href={getSecureImageUrl(storeFiles.nationalIdBackImage)} target="_blank" rel="noreferrer">
                                                    <img src={getSecureImageUrl(storeFiles.nationalIdBackImage)} alt="National ID Back" className="w-full h-32 object-cover bg-gray-50 border rounded-md hover:opacity-80 transition cursor-pointer" />
                                                </a>
                                            </div>
                                        )}
                                        {storeFiles.storeLicenseImage && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">رخصة المتجر التجارية</p>
                                                <a href={getSecureImageUrl(storeFiles.storeLicenseImage)} target="_blank" rel="noreferrer">
                                                    <img src={getSecureImageUrl(storeFiles.storeLicenseImage)} alt="Store License" className="w-full h-32 object-cover bg-gray-50 border rounded-md hover:opacity-80 transition cursor-pointer" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : Array.isArray(storeFiles) && storeFiles.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {storeFiles.map((file: any, index: number) => (
                                            <a
                                                key={file.id || index}
                                                href={getSecureImageUrl(file.url || file)} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md border border-blue-200 transition text-sm font-medium"
                                            >
                                                📎 {file.name || `مستند مرفق ${index + 1}`}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border text-sm">لا توجد ملفات مرفقة لهذا المتجر.</div>
                                )}
                            </div>

                        </div>

                        <div className="p-6 border-t flex justify-end space-x-2 space-x-reverse bg-gray-50">
                            {statusFilter === 'Pending' ? (
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
                            ) : (
                                <button
                                    onClick={() => handleDelete(selectedRequest.id)}
                                    className="bg-red-600 hover:bg-red-700 mx-3 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
                                    disabled={isDeletingStore}
                                >
                                    {isDeletingStore ? 'جاري الحذف...' : 'حذف المتجر'}
                                </button>
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