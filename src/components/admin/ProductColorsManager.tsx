import React, { useState } from 'react';
import { useGetClothingItems, useAddColorForProduct } from '../../hooks/useClothingItem';

const ProductColorsManager = ({ productId }: { productId: number }) => {
    // 1. جلب الألوان الحالية
    const { data: colors, isLoading } = useGetClothingItems(productId);
    
    // 2. دالة الإضافة
    const addColorMutation = useAddColorForProduct();

    // حالات (States) للنموذج
    const [colorName, setColorName] = useState('');
    const [colorHex, setColorHex] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleAddColor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return alert("الرجاء اختيار صورة");

        // تحضير الـ FormData بناءً على Swagger
        const formData = new FormData();
        formData.append('Color', colorName);
        formData.append('ColorHexCode', colorHex);
        formData.append('Image', imageFile);

        addColorMutation.mutate({ productId, formData }, {
            onSuccess: () => {
                alert('تمت إضافة اللون بنجاح!');
                setColorName('');
                setColorHex('');
                setImageFile(null);
            }
        });
    };

    if (isLoading) return <div>جاري تحميل الألوان...</div>;

    return (
        <div className="p-4 border rounded-lg bg-white mt-6">
            <h3 className="text-lg font-bold mb-4">ألوان المنتج</h3>
            
            {/* عرض الألوان الحالية */}
            <div className="flex gap-4 mb-6 flex-wrap">
                {colors?.map((item: any) => (
                    <div key={item.id} className="border p-2 rounded text-center">
                        <img src={item.imageUrl} alt={item.color} className="w-16 h-16 object-cover mb-2 rounded" />
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.colorHexCode }}></span>
                            <span>{item.color}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* نموذج إضافة لون جديد */}
            <form onSubmit={handleAddColor} className="bg-gray-50 p-4 rounded border">
                <h4 className="font-semibold mb-3">إضافة لون جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text" 
                        placeholder="اسم اللون (مثال: أحمر)" 
                        value={colorName} 
                        onChange={(e) => setColorName(e.target.value)} 
                        className="border p-2 rounded"
                        required
                    />
                    <input 
                        type="color" 
                        value={colorHex} 
                        onChange={(e) => setColorHex(e.target.value)} 
                        className="border p-1 rounded h-10 w-full"
                        required
                    />
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                        className="border p-2 rounded bg-white"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={addColorMutation.isPending}
                >
                    {addColorMutation.isPending ? 'جاري الإضافة...' : 'إضافة اللون'}
                </button>
            </form>
        </div>
    );
};

export default ProductColorsManager;