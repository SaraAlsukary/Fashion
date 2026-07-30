// components/UserProfile/StoreRequestsTab.tsx
import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllRequestStoreByUser, useStore } from '../../hooks/useStore';
import ConfirmModal from '../templates/ConfirmModal';


export default function StoreRequestsTab() {
    const navigate = useNavigate();
    const { data: storeRequestsRes, isLoading: requestsLoading } = useGetAllRequestStoreByUser();
    const { cancelStoreRequest, isCancelingRequest } = useStore();
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; requestId: number | null }>({ isOpen: false, requestId: null });

    const storeRequests = (storeRequestsRes as any)?.data || [];

    const handleConfirmCancel = () => {
        if (!modalInfo.requestId) return;
        cancelStoreRequest(modalInfo.requestId);
        setModalInfo({ isOpen: false, requestId: null });
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">طلبات الانضمام كصاحب متجر</h2>
                <button onClick={() => navigate('/auth/join')} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                    ➕ تقديم طلب جديد
                </button>
            </div>

            {requestsLoading ? <p className="text-sm text-gray-500">جاري تحميل الطلبات... ⏳</p> : storeRequests.length > 0 ? (
                <div className="space-y-4">
                    {storeRequests.map((req: any) => (
                        <div key={req.id} className="border border-gray-100 rounded-xl p-4 hover:border-amber-200 transition-colors bg-white">
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                <div>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">طلب رقم #{req.id}</span>
                                    <p className="text-xs text-gray-400 mt-1">{req.createdAt ? new Date(req.createdAt).toLocaleDateString('ar-EG') : 'تاريخ غير متاح'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${req.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : req.status === 'Approved' ? 'bg-green-50 text-green-600' : req.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {req.status === 'Pending' ? 'قيد الانتظار' : req.status === 'Approved' ? 'تمت الموافقة ✅' : req.status === 'Rejected' ? 'مرفوض ❌' : req.status === 'Cancelled' ? 'ملغي' : req.status}
                                    </span>
                                    {req.status === 'Pending' && (
                                        <button onClick={() => setModalInfo({ isOpen: true, requestId: req.id })} className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold">
                                            إلغاء الطلب
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm flex flex-col gap-1">
                                <p className="text-gray-700 font-bold">اسم المتجر: <span className="font-normal text-amber-600">{req.storeName || 'غير متوفر'}</span></p>
                                {req.description && <p className="text-gray-600 text-xs mt-1"><span className="font-bold">الوصف:</span> {req.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl"><p className="text-sm text-gray-500">ليس لديك أي طلبات انضمام كتاجر.</p></div>}

            <ConfirmModal
                isOpen={modalInfo.isOpen}
                title="إلغاء طلب فتح المتجر"
                message="هل أنت متأكد من رغبتك في التراجع وإلغاء طلب فتح المتجر؟"
                isLoading={isCancelingRequest}
                onConfirm={handleConfirmCancel}
                onClose={() => setModalInfo({ isOpen: false, requestId: null })}
            />
        </div>
    );
}