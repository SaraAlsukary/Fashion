import React, { useState } from 'react';
import {
  useGetClothingItems,
  useAddColorForProduct,
  useGetSizesByColor,
  useAddSizesForProduct
} from '../../hooks/useClothingItem';
import { useGetProducts } from '../../hooks/useProduct';
import { useGetStoresByAdmin } from '../../hooks/useStore';

const AttributesPage = () => {
  // --- States للتنقل والاختيار ---
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedColorItem, setSelectedColorItem] = useState<any | null>(null);

  // --- States للنوافذ المنبثقة (Modals) ---
  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false);
  const [isAddSizeModalOpen, setIsAddSizeModalOpen] = useState(false);

  // --- States لنماذج الإدخال (Forms) ---
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [colorImage, setColorImage] = useState<File | null>(null);

  const [sizeName, setSizeName] = useState('');
  const [sizeQuantity, setSizeQuantity] = useState<number>(0);

  // --- جلب البيانات (Queries) ---
  const { data: store } = useGetStoresByAdmin();
  const { data: products } = useGetProducts(store?.id);
  const { data: clothingItems, isLoading: isLoadingColors } = useGetClothingItems(Number(selectedProductId));
  // جلب المقاسات بناءً على اسم اللون كما يطلبه الـ API
  const { data: sizes, isLoading: isLoadingSizes } = useGetSizesByColor(Number(selectedProductId), selectedColorItem?.color || '');

  // --- الإضافة (Mutations) ---
  const addColorMutation = useAddColorForProduct();
  const addSizeMutation = useAddSizesForProduct();

  // --- دوال التعامل مع الأحداث ---
  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !colorName || !colorImage) return;

    const formData = new FormData();
    formData.append('Color', colorName);
    formData.append('ColorHexCode', colorHex); // أبقيناها تحسباً لأن الـ POST لا يزال يتطلبها
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
      stockQuantity: sizeQuantity // الـ API لا يعيد الكمية في الـ GET لكن قد يطلبها في الـ POST
    };

    addSizeMutation.mutate(
      { productColorId: selectedColorItem.id, sizesData: sizeData },
      {
        onSuccess: () => {
          setIsAddSizeModalOpen(false);
          setSizeName('');
          setSizeQuantity(0);
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
              setSelectedColorItem(null); // إعادة تعيين اللون عند تغيير المنتج
            }}
          >
            <option value="">-- اختر منتجاً --</option>
            {products?.data?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 2. قسم الألوان (يظهر فقط إذا تم اختيار منتج) */}
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
                {/* افتراض أن الـ hook يرجع البيانات مباشرة كمصفوفة بناءً على شكل الرد */}
                {clothingItems?.data?.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedColorItem(item)}
                    className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all ${selectedColorItem?.id === item.id
                        ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105'
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    {/* تم تعديل رابط الصورة ليقرأ من Cloudinary مباشرة كما يأتي من الـ API */}
                    <img
                      src={item.image ? item.image.includes('https://res.cloudinary.com') ? item.image : `http://www.marketexpress.somee.com/${item.image}` : '/placeholder-product.png'}

                      alt={item.color}
                      className="w-20 h-20 object-cover rounded-lg mb-2 shadow-sm"
                    />
                    <span className="font-medium text-gray-800">{item.color}</span>
                  </div>
                ))}
                {(!clothingItems?.data || clothingItems.data.length === 0) && (
                  <div className="col-span-full text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                    لا توجد ألوان لهذا المنتج بعد.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. قسم المقاسات (يظهر فقط إذا تم اختيار لون) */}
        {selectedColorItem && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                3. مقاسات اللون:
                <span className="text-blue-600">{selectedColorItem.color}</span>
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
                      <th className="p-4 border-b font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* تم تعديل المفاتيح والبيانات لتطابق خصائص productSizeId و isFoundProduct */}
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
                        <td className="p-4 border-b">
                          <button className="text-blue-500 hover:text-blue-700 underline text-sm">تعديل</button>
                        </td>
                      </tr>
                    ))}
                    {(!sizes?.data || sizes.data.length === 0) && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">لا توجد مقاسات مضافة لهذا اللون.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* Modals */}
      {/* ========================================== */}

      {/* مودال إضافة لون */}
      {isAddColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">إضافة لون جديد</h3>
              <button onClick={() => setIsAddColorModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddColor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم اللون (مثال: أبيض)</label>
                <input
                  type="text"
                  required
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كود اللون (Hex Code)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="h-10 w-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج بهذا اللون</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setColorImage(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={addColorMutation.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {addColorMutation.isPending ? 'جاري الحفظ...' : 'حفظ اللون'}
                </button>
                <button type="button" onClick={() => setIsAddColorModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إضافة مقاس */}
      {isAddSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">إضافة مقاس للون ({selectedColorItem?.color})</h3>
              <button onClick={() => setIsAddSizeModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddSize} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المقاس (Shoe38, Shoe39...)</label>
                <input
                  type="text"
                  required
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتوفرة في المخزن</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={sizeQuantity}
                  onChange={(e) => setSizeQuantity(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg focus:ring-emerald-500"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={addSizeMutation.isPending} className="flex-1 bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600">
                  {addSizeMutation.isPending ? 'جاري الحفظ...' : 'حفظ المقاس'}
                </button>
                <button type="button" onClick={() => setIsAddSizeModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttributesPage;