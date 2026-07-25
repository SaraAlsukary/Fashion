import React, { useState, useEffect } from 'react';
import { useGetStoresByAdmin, useStore } from '../../hooks/useStore'; // تأكد من المسار الصحيح للـ hooks

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
      // افتراض أن store هو الكائن المباشر (Object) بناءً على الـ JSON المرفق
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

    // استخدام FormData لدعم رفع الصور بالإضافة للنصوص
    const submitData = new FormData();

    // إضافة الـ ID الخاص بالمتجر للتعديل
    const currentStore = Array.isArray(store) ? store[0] : store;
    if (currentStore?.id) {
      submitData.append('Id', currentStore.id.toString());
    }

    // إضافة البيانات النصية
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    // إضافة الصور في حال تم اختيار صور جديدة
    if (logoFile) {
      submitData.append('Logo', logoFile);
    }
    if (featuredImageFile) {
      submitData.append('FeaturedImage', featuredImageFile);
    }

    // استدعاء دالة التحديث
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

  // المتجر الحالي للحصول على مسارات الصور القديمة
  const currentStore = Array.isArray(store) ? store[0] : store;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
            {currentStore?.logo ? (
              <img src={`http://marketexpress.somee.com${currentStore.logo}`} alt="Logo" className="object-cover w-full h-full" />
            ) : (
              <span className="text-2xl">🏪</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">إعدادات المتجر</h1>
            <p className="text-gray-500">قم بتحديث بيانات متجرك والصور الخاصة به</p>
          </div>
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
                  <img src={`http://marketexpress.somee.com${currentStore.logo}`} alt="Current Logo" className="h-20 mx-auto mb-3 rounded shadow-sm" />
                )}
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>

              {/* الصورة البارزة */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                <label className="block text-sm font-medium text-gray-700 mb-2">تحديث الصورة البارزة (Featured Image)</label>
                {currentStore?.featuredImage && !featuredImageFile && (
                  <img src={`http://marketexpress.somee.com${currentStore.featuredImage}`} alt="Current Featured" className="h-20 mx-auto mb-3 rounded shadow-sm object-cover w-full" />
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