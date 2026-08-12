import React, { useState } from 'react';
import {
    useGetClothingItems,
    useAddColorForProduct,
    useDeleteProductColor
} from '../../hooks/useClothingItem';
import toast from 'react-hot-toast';
import { getSecureImageUrl } from '../../constant/imageURL';

interface ProductColorsManagerProps {
    productId: number;
    selectedColorId?: number; // لمعرفة اللون النشط حالياً
    onColorSelect: (colorItem: any) => void; // دالة يتم استدعاؤها عند الضغط على لون
    onEditColor: (colorItem: any, e: React.MouseEvent) => void; // دالة لفتح مودال التعديل
}

const ProductColorsManager = ({
    productId,
    selectedColorId,
    onColorSelect,
    onEditColor
}: ProductColorsManagerProps) => {
    // 1. جلب الألوان الحالية
    const { data: colors, isLoading } = useGetClothingItems(productId);

    // 2. دالة الإضافة
    const addColorMutation = useAddColorForProduct();

    // 3. دالة الحذف
    const deleteColorMutation = useDeleteProductColor();

    // حالات (States) للنموذج
    const [colorName, setColorName] = useState('');
    const [colorHex, setColorHex] = useState('#000000');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleAddColor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return toast.error("الرجاء اختيار صورة");

        // تحضير الـ FormData بناءً على Swagger
        const formData = new FormData();
        formData.append('Color', colorName);
        formData.append('ColorHexCode', colorHex);
        formData.append('Image', imageFile);

        addColorMutation.mutate({ productId, formData }, {
            onSuccess: () => {
                toast.success('تمت إضافة اللون بنجاح!');
                setColorName('');
                setColorHex('');
                setImageFile(null);

                // تفريغ حقل الصورة
                const fileInput = document.getElementById('colorFileInput') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        });
    };

    // معالج حذف اللون
    const handleDeleteColor = (productColorId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // 👈 مهم جداً: يمنع تحديد اللون عند الضغط على زر الحذف

        if (window.confirm('هل أنت متأكد من حذف هذا اللون؟')) {
            deleteColorMutation.mutate(
                { productColorId, productId },
                {
                    onSuccess: () => {
                        toast.success('تم حذف اللون بنجاح!');
                    },
                    onError: () => {
                        toast.error('حدث خطأ أثناء حذف اللون.');
                    },
                }
            );
        }
    };

    if (isLoading) return <div className="p-4 mt-6 text-gray-500 font-medium">جاري تحميل الألوان...</div>;

    return (
        <div className="p-4 border rounded-lg bg-white mt-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">ألوان المنتج</h3>

            {/* عرض الألوان الحالية - بنفس تصميم المكون الأب تماماً */}
            <div className="flex gap-4 mb-6 flex-wrap">
                {colors?.data.map((item: any) => (
                    <div
                        key={item.id}
                        onClick={() => onColorSelect(item)} // إخبار الصفحة الأب باللون المختار
                        className={`relative cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all min-w-[120px] ${selectedColorId === item.id
                            ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105'
                            : 'border-gray-200 hover:border-blue-300'
                            }`}
                    >
                        <img
                            src={getSecureImageUrl(item.image)} 
                            alt={item.color}
                            className="w-20 h-20 object-cover mb-2 rounded mx-auto border border-gray-100"
                        />
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: item.colorHexCode }}
                            ></span>
                            <span className="font-medium text-sm text-gray-700">{item.color}</span>
                        </div>

                        {/* زر التعديل */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // 👈 يمنع تحديد اللون عند الضغط على زر التعديل
                                onEditColor(item, e);
                            }}
                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-gray-100 hover:shadow transition-all text-gray-600 border border-gray-100"
                            title="تعديل"
                        >
                            ✏️
                        </button>

                        {/* زر الحذف */}
                        <button
                            onClick={(e) => handleDeleteColor(item.id, e)}
                            disabled={deleteColorMutation.isPending}
                            className="w-full mt-auto bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 px-2 rounded transition-colors disabled:bg-gray-400 font-medium"
                        >
                            {deleteColorMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                ))}
            </div>

            {/* نموذج إضافة لون جديد */}
            <form onSubmit={handleAddColor} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-4 text-gray-700">إضافة لون جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="اسم اللون (مثال: أحمر)"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded bg-white focus:outline-none focus:border-blue-500"
                        required
                    />

                    <div className="flex items-center bg-white border border-gray-300 rounded p-1">
                        <input
                            type="color"
                            value={colorHex || "#000000"} // إضافة قيمة افتراضية
                            onChange={(e) => setColorHex(e.target.value)}
                        />
                        <span className="ml-2 text-sm text-gray-500 w-full text-left uppercase">
                            {colorHex || '#000000'}
                        </span>
                    </div>

                    <input
                        id="colorFileInput"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="border border-gray-300 p-2 rounded bg-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    disabled={addColorMutation.isPending}
                >
                    {addColorMutation.isPending ? 'جاري الإضافة...' : 'إضافة اللون'}
                </button>
            </form>
        </div>
    );
};

export default ProductColorsManager;