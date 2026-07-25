import React, { useState } from 'react';
import {
  useGetClothingItems,
  useAddColorForProduct,
  useUpdateColorDetails,
  useGetSizesByColor,
  useAddSizesForProduct,
  useUpdateSizeForProduct
} from '../../hooks/useClothingItem';
import { useGetProducts } from '../../hooks/useProduct';
import { useGetStoresByAdmin } from '../../hooks/useStore';

const AVAILABLE_SIZES = [
  "XS", "S", "M", "L", "XL", "XXL",
  "Shoe36", "Shoe37", "Shoe38", "Shoe39", "Shoe40",
  "Shoe41", "Shoe42", "Shoe43", "Shoe44", "Shoe45"
];

const AttributesPage = () => {
  // --- States للتنقل والاختيار ---
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedColorItem, setSelectedColorItem] = useState<any | null>(null);

  // --- States لنماذج الإضافة (Add Modals) ---
  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false);
  const [isAddSizeModalOpen, setIsAddSizeModalOpen] = useState(false);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [colorImage, setColorImage] = useState<File | null>(null);
  const [sizeName, setSizeName] = useState('');
  const [sizeQuantity, setSizeQuantity] = useState<number>(0);

  // --- States لنماذج التعديل (Edit Modals) ---
  const [isEditColorModalOpen, setIsEditColorModalOpen] = useState(false);
  const [editingColorId, setEditingColorId] = useState<number | null>(null);
  const [editColorName, setEditColorName] = useState('');
  const [editColorImage, setEditColorImage] = useState<File | null>(null);

  const [isEditSizeModalOpen, setIsEditSizeModalOpen] = useState(false);
  const [editingSizeId, setEditingSizeId] = useState<number | null>(null);
  const [editSizeName, setEditSizeName] = useState('');
  const [editSizeQuantity, setEditSizeQuantity] = useState<number>(0);

  // --- جلب البيانات (Queries) ---
  const { data: store } = useGetStoresByAdmin();
  const { data: products } = useGetProducts(store?.id);
  const { data: clothingItems, isLoading: isLoadingColors } = useGetClothingItems(Number(selectedProductId));
  const { data: sizes, isLoading: isLoadingSizes } = useGetSizesByColor(Number(selectedProductId), selectedColorItem?.color || '');

  // --- الإضافة والتعديل (Mutations) ---
  const addColorMutation = useAddColorForProduct();
  const addSizeMutation = useAddSizesForProduct();
  const updateColorMutation = useUpdateColorDetails();
  const updateSizeMutation = useUpdateSizeForProduct();

  // ==========================================
  // دوال الإضافة
  // ==========================================
  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !colorName || !colorImage) return;

    const formData = new FormData();
    formData.append('Color', colorName);
    formData.append('ColorHexCode', colorHex);
    formData.append('Image', colorImage);

    addColorMutation.mutate(
      { productId: Number(selectedProductId), formData },
      {
        onSuccess: () => {
          setIsAddColorModalOpen(false);
          setColorName('');
          setColorHex('#000000');
          setColorImage(null);
        }
      }
    );
  };

  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColorItem || !sizeName) return;

    const sizeData = {
      size: sizeName,
      quantity: Number(sizeQuantity)
    };

    addSizeMutation.mutate(
      { productColorId: selectedColorItem.id, sizesData: [sizeData] },
      {
        onSuccess: () => {
          setIsAddSizeModalOpen(false);
          setSizeName('');
          setSizeQuantity(0);
        }
      }
    );
  };

  // ==========================================
  // دوال التعديل
  // ==========================================
  const openEditColorModal = (item: any, e: React.MouseEvent) => {
    e.stopPropagation(); // لمنع تفعيل حدث اختيار اللون عند الضغط على زر التعديل
    setEditingColorId(item.id);
    setEditColorName(item.color);
    setEditColorImage(null); // إعادة تعيين الصورة (يتم رفع صورة جديدة إذا أراد فقط)
    setIsEditColorModalOpen(true);
  };

  const handleEditColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColorId || !editColorName) return;

    const formData = new FormData();
    if (editColorImage) {
      formData.append('Image', editColorImage);
    }

    updateColorMutation.mutate(
      { clothingItemId: editingColorId, color: editColorName, formData },
      {
        onSuccess: () => {
          setIsEditColorModalOpen(false);
          // إذا كان اللون المعدل هو نفس اللون المحدد حالياً، نقوم بإلغاء تحديده لتحديث البيانات
          if (selectedColorItem?.id === editingColorId) {
            setSelectedColorItem(null);
          }
        }
      }
    );
  };

  const openEditSizeModal = (size: any) => {
    setEditingSizeId(size.productSizeId);
    setEditSizeName(size.size);
    setEditSizeQuantity(size.quantity);
    setIsEditSizeModalOpen(true);
  };

  const handleEditSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSizeId || !editSizeName) return;

    const sizeData = {
      size: editSizeName,
      quantity: Number(editSizeQuantity)
    };

    updateSizeMutation.mutate(
      { productSizeId: editingSizeId, sizeData },
      {
        onSuccess: () => {
          setIsEditSizeModalOpen(false);
        }
      }
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. اختيار المنتج */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">1. اختر المنتج لإدارة خصائصه</h2>
          <select
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(Number(e.target.value));
              setSelectedColorItem(null);
            }}
          >
            <option value="">-- اختر منتجاً --</option>
            {products?.data?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 2. قسم الألوان */}
        {selectedProductId && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">2. الألوان المتوفرة للمنتج</h2>
              <button
                onClick={() => setIsAddColorModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                + إضافة لون جديد
              </button>
            </div>

            {isLoadingColors ? (
              <p className="text-gray-500">جاري تحميل الألوان...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {clothingItems?.data?.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedColorItem(item)}
                    className={`relative cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all ${selectedColorItem?.id === item.id
                      ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <img
                      src={item.image ? item.image.includes('https://res.cloudinary.com') ? item.image : `http://www.marketexpress.somee.com/${item.image}` : '/placeholder-product.png'}
                      alt={item.color}
                      className="w-20 h-20 object-cover rounded-lg mb-2 shadow-sm"
                    />
                    <span className="font-medium text-gray-800">{item.color}</span>

                    {/* زر تعديل اللون */}
                    <button
                      onClick={(e) => openEditColorModal(item, e)}
                      className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow hover:bg-white text-gray-600 hover:text-blue-600 transition"
                      title="تعديل اللون"
                    >
                      ✏️
                    </button>
                  </div>
                ))}
                {(!clothingItems?.data || clothingItems.data.length === 0) && (
                  <div className="col-span-full text-center p-8 text-gray-500 bg-gray-50 rounded-lg border-dashed border-2">
                    لا توجد ألوان مضافة لهذا المنتج بعد. أضف لوناً للبدء.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. قسم المقاسات - تم تحسين الـ UX ليكون أوضح */}
        {selectedProductId && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
            {!selectedColorItem ? (
              // رسالة واضحة في حال لم يتم اختيار لون بعد
              <div className="text-center py-10 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-100">
                <span className="text-4xl mb-3 block">🎨</span>
                <h3 className="text-lg font-bold text-gray-700">يرجى اختيار لون</h3>
                <p className="text-gray-500 mt-2">انقر على أحد الألوان في القسم أعلاه لعرض المقاسات المتوفرة وإضافة مقاسات جديدة.</p>
              </div>
            ) : (
              // عرض المقاسات إذا تم اختيار لون
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    3. مقاسات اللون:
                    <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-md">{selectedColorItem.color}</span>
                  </h2>
                  <button
                    onClick={() => setIsAddSizeModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    + إضافة مقاس جديد
                  </button>
                </div>

                {isLoadingSizes ? (
                  <p className="text-gray-500">جاري تحميل المقاسات...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600">
                          <th className="p-4 border-b font-medium">المقاس (Size)</th>
                          <th className="p-4 border-b font-medium">حالة التوفر</th>
                          <th className="p-4 border-b font-medium">الكمية</th>
                          <th className="p-4 border-b font-medium">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizes?.data?.map((size: any) => (
                          <tr key={size.productSizeId} className="hover:bg-gray-50">
                            <td className="p-4 border-b font-bold text-gray-800">{size.size}</td>
                            <td className="p-4 border-b">
                              <span className={`px-3 py-1 rounded-full font-medium text-sm ${size.isFoundProduct
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {size.isFoundProduct ? 'متوفر' : 'غير متوفر'}
                              </span>
                            </td>
                            <td className="p-4 border-b font-bold text-gray-800">{size.quantity}</td>
                            <td className="p-4 border-b">
                              {/* زر تعديل المقاس */}
                              <button
                                onClick={() => openEditSizeModal(size)}
                                className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded transition"
                              >
                                تعديل ✏️
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!sizes?.data || sizes.data.length === 0) && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">لا توجد مقاسات مضافة لهذا اللون.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* Modals (الإضافة والتعديل) */}
      {/* ========================================== */}

      {/* 1. مودال إضافة لون */}
      {isAddColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* ... (نفس كود الإضافة الخاص بك لم يتغير) ... */}
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">إضافة لون جديد</h3>
              <button onClick={() => setIsAddColorModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddColor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم اللون</label>
                <input type="text" required value={colorName} onChange={(e) => setColorName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج بهذا اللون</label>
                <input type="file" accept="image/*" required onChange={(e) => setColorImage(e.target.files ? e.target.files[0] : null)} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={addColorMutation.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{addColorMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}</button>
                <button type="button" onClick={() => setIsAddColorModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. مودال تعديل لون */}
      {isEditColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">تعديل اللون</h3>
              <button onClick={() => setIsEditColorModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleEditColor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم اللون</label>
                <input type="text" required value={editColorName} onChange={(e) => setEditColorName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تحديث الصورة (اختياري)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditColorImage(e.target.files ? e.target.files[0] : null)} className="w-full p-2 border rounded-lg" />
                <span className="text-xs text-gray-500 mt-1 block">اتركه فارغاً إذا كنت لا تريد تغيير الصورة الحالية</span>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={updateColorMutation.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{updateColorMutation.isPending ? 'جاري التحديث...' : 'تحديث البيانات'}</button>
                <button type="button" onClick={() => setIsEditColorModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. مودال إضافة مقاس */}
      {isAddSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* ... (نفس كود الإضافة الخاص بك لم يتغير) ... */}
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">إضافة مقاس للون ({selectedColorItem?.color})</h3>
              <button onClick={() => setIsAddSizeModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddSize} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المقاس</label>
                <select required value={sizeName} onChange={(e) => setSizeName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-emerald-500 bg-white">
                  <option value="" disabled>-- اختر المقاس --</option>
                  {AVAILABLE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتوفرة</label>
                <input type="number" min="0" required value={sizeQuantity} onChange={(e) => setSizeQuantity(e.target.value === '' ? 0 : parseInt(e.target.value, 10))} className="w-full p-2 border rounded-lg focus:ring-emerald-500" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={addSizeMutation.isPending} className="flex-1 bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600">{addSizeMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}</button>
                <button type="button" onClick={() => setIsAddSizeModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. مودال تعديل مقاس */}
      {isEditSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">تعديل المقاس</h3>
              <button onClick={() => setIsEditSizeModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleEditSize} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المقاس</label>
                <select required value={editSizeName} onChange={(e) => setEditSizeName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500 bg-white">
                  <option value="" disabled>-- اختر المقاس --</option>
                  {AVAILABLE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تحديث الكمية</label>
                <input type="number" min="0" required value={editSizeQuantity} onChange={(e) => setEditSizeQuantity(e.target.value === '' ? 0 : parseInt(e.target.value, 10))} className="w-full p-2 border rounded-lg focus:ring-blue-500" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={updateSizeMutation.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{updateSizeMutation.isPending ? 'جاري التحديث...' : 'تحديث المقاس'}</button>
                <button type="button" onClick={() => setIsEditSizeModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AttributesPage;