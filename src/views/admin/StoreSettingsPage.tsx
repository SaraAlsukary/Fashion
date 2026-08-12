import React, { useState, useEffect } from 'react';
import { useGetStoresByAdmin, useStore } from '../../hooks/useStore'; // تأكد من المسار الصحيح للـ hooks
import { getSecureImageUrl } from '../../constant/imageURL';

// ==========================================
// 1. مكون نافذة الحذف (Delete Modal)
// ==========================================
export const DeleteStoreModal = ({ storeId, storeName, onSuccess }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
    deleteStore(storeId, {
      onSuccess: () => {
        setIsOpen(false);
        if (onSuccess) onSuccess(storeId);
      },
      onError: (err: any) => {
        setLocalError(err?.response?.data?.message || 'فشل في حذف المتجر، يرجى المحاولة لاحقاً');
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer text-white bg-red-600 hover:bg-red-800  rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        حذف المتجر
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                تأكيد حذف المتجر
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                هل أنت متأكد من رغبتك في حذف {storeName ? <strong className="text-slate-800 dark:text-slate-200">"{storeName}"</strong> : 'هذا المتجر'}؟ لا يمكن التراجع عن هذه العملية بعد إتمامها.
              </p>
              {localError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl text-right">
                  {localError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeletingStore}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
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

// ==========================================
// 2. مكون صفحة الإعدادات الأساسي
// ==========================================
const StoreSettingsPage = () => {
  // 1. جلب بيانات المتجر
  const { data: store, isLoading, isError } = useGetStoresByAdmin();

  // 2. استدعاء دوال التعديل
  const { updateStore, isUpdatingStore } = useStore();

  // 3. States لبيانات النموذج (Form)
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    storePhoneNumber: '',
    storeEmail: '',
    address: '',
    workingHoursStart: '',
    workingHoursEnd: '',
  });

  // States منفصلة للصور (لرفع ملفات جديدة)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

  // 4. تعبئة البيانات عند نجاح جلبها من السيرفر
  useEffect(() => {
    if (store) {
      const currentStore = Array.isArray(store) ? store[0] : store;

      if (currentStore) {
        setFormData({
          storeName: currentStore.storeName || '',
          description: currentStore.description || '',
          storePhoneNumber: currentStore.storePhoneNumber || '',
          storeEmail: currentStore.storeEmail || '',
          address: currentStore.address || '',
          workingHoursStart: currentStore.workingHoursStart || '',
          workingHoursEnd: currentStore.workingHoursEnd || '',
        });
      }
    }
  }, [store]);

  // 5. التعامل مع تغييرات الحقول النصية
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 6. إرسال البيانات
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    const currentStore = Array.isArray(store) ? store[0] : store;

    if (currentStore?.id) {
      submitData.append('Id', currentStore.id.toString());
    }

    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    if (logoFile) {
      submitData.append('Logo', logoFile);
    }
    if (featuredImageFile) {
      submitData.append('FeaturedImage', featuredImageFile);
    }

    updateStore(submitData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg m-6">
        حدث خطأ أثناء جلب بيانات المتجر.
      </div>
    );
  }

  const currentStore = Array.isArray(store) ? store[0] : store;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header - تم إضافة زر الحذف هنا */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
              {currentStore?.logo ? (
                <img src={getSecureImageUrl(currentStore?.logo)} alt="Logo" className="object-cover w-full h-full" />
              ) : (
                <span className="text-2xl">🏪</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">إعدادات المتجر</h1>
              <p className="text-gray-500">قم بتحديث بيانات متجرك والصور الخاصة به</p>
            </div>
          </div>

          {/* استدعاء مكون الحذف وتمرير الـ Props المطلوبة */}
          {currentStore?.id && (
            <DeleteStoreModal
              storeId={currentStore.id}
              storeName={currentStore.storeName}
              onSuccess={() => {
                // يمكنك إضافة توجيه هنا بعد الحذف، مثال:
                // window.location.href = '/dashboard';
              }}
            />
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          {/* قسم المعلومات الأساسية */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">المعلومات الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" name="storeEmail" value={formData.storeEmail} onChange={handleChange} required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input type="tel" name="storePhoneNumber" value={formData.storePhoneNumber} onChange={handleChange} required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف المتجر</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
          </section>

          {/* قسم أوقات العمل */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">أوقات العمل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وقت البدء</label>
                <input type="time" name="workingHoursStart" value={formData.workingHoursStart} onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وقت الإغلاق</label>
                <input type="time" name="workingHoursEnd" value={formData.workingHoursEnd} onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </section>

          {/* قسم الصور */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">الصور وشعار المتجر</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* الشعار */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                <label className="block text-sm font-medium text-gray-700 mb-2">تحديث الشعار (Logo)</label>
                {currentStore?.logo && !logoFile && (
                  <img src={getSecureImageUrl(currentStore?.logo)} alt="Current Logo" className="h-20 mx-auto mb-3 rounded shadow-sm" />
                )}
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>

              {/* الصورة البارزة */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                <label className="block text-sm font-medium text-gray-700 mb-2">تحديث الصورة البارزة (Featured Image)</label>
                {currentStore?.featuredImage && !featuredImageFile && (
                  <img src={getSecureImageUrl(currentStore?.featuredImage)} alt="Current Featured" className="h-20 mx-auto mb-3 rounded shadow-sm object-cover w-full" />
                )}
                <input type="file" accept="image/*" onChange={(e) => setFeaturedImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>
            </div>
          </section>

          {/* أزرار الحفظ */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
              إلغاء التعديلات
            </button>
            <button type="submit" disabled={isUpdatingStore} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              {isUpdatingStore ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-b-transparent rounded-full"></span>
                  جاري الحفظ...
                </>
              ) : 'حفظ التغييرات'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default StoreSettingsPage;