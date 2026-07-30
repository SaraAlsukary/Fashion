import { useState } from 'react';
import { useStore } from '../../hooks/useStore';

export const DeleteStoreModal = ({ storeId, storeName, onSuccess }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    
    // استخدام الهوك الموحد فقط
    const { deleteStore, isDeletingStore } = useStore();

    const handleOpen = () => {
        setLocalError(null);
        setIsOpen(true);
    };

    const handleClose = () => {
        if (!isDeletingStore) {
            setIsOpen(false);
        }
    };

    const handleConfirmDelete = () => {
        setLocalError(null);
        
        // تمرير المتعرف ودوال التحكم بالنجاح والخطأ
        deleteStore(storeId, {
            onSuccess: () => {
                setIsOpen(false);
                if (onSuccess) onSuccess(storeId);
            },
            onError: (err: any) => {
                // التقاط رسالة الخطأ وعرضها داخل النافذة (بالإضافة لإشعار التوست الموجود في الهوك)
                setLocalError(err?.response?.data?.message || 'فشل في حذف المتجر، يرجى المحاولة لاحقاً');
            }
        });
    };

    return (
        <>
            {/* زر الحذف رئيسي */}
            <button
                onClick={handleOpen}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف المتجر
            </button>

            {/* نافذة التأكيد (Modal) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all transform scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* أيقونة التحذير */}
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        {/* النصوص والمعلومات */}
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                تأكيد حذف المتجر
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                هل أنت متأكد من رغبتك في حذف {storeName ? <strong className="text-slate-800 dark:text-slate-200">"{storeName}"</strong> : 'هذا المتجر'}؟ لا يمكن التراجع عن هذه العملية بعد إتمامها.
                            </p>

                            {/* رسالة الخطأ إن وجدت */}
                            {localError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl text-right">
                                    {localError}
                                </div>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={handleClose}
                                disabled={isDeletingStore}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeletingStore}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-red-500/20 disabled:opacity-50"
                            >
                                {isDeletingStore ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الحذف...
                                    </>
                                ) : (
                                    'تأكيد الحذف'
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};