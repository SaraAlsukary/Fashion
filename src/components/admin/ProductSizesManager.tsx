import React, { useState } from 'react';
// لا تنسَ استيراد useDeleteProductSize
import { useGetSizesByColor, useAddSizesForProduct, useDeleteProductSize } from '../../hooks/useClothingItem';
import toast from 'react-hot-toast';

const ProductSizesManager = ({ productId, colorName, productColorId }: { productId: number, colorName: string, productColorId: number }) => {
    // جلب المقاسات المرتبطة بالمنتج واللون
    const { data: sizes, isLoading } = useGetSizesByColor(productId, colorName);
    const addSizeMutation = useAddSizesForProduct();
    console.log(sizes)
    // تعريف الدالة الخاصة بالحذف
    const deleteSizeMutation = useDeleteProductSize();

    const [sizeName, setSizeName] = useState('');
    const [quantity, setQuantity] = useState(0);

    const handleAddSize = (e: React.FormEvent) => {
        e.preventDefault();

        const sizeData = {
            sizeName,
            stockQuantity: quantity
        };

        addSizeMutation.mutate({ productColorId, sizesData: sizeData }, {
            onSuccess: () => {
                toast.success('تمت إضافة المقاس بنجاح');
                setSizeName('');
                setQuantity(0);
            }
        });
    };

    // دالة للتعامل مع زر الحذف
    const handleDeleteSize = (sizeId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقاس؟')) {
            deleteSizeMutation.mutate(sizeId, {
                onSuccess: () => {
                    toast.success('تم حذف المقاس بنجاح');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء الحذف');
                }
            });
        }
    };

    return (
        <div className="p-4 border rounded-lg mt-4 bg-white">
            <h4 className="font-bold mb-4 text-right">المقاسات المتاحة للون: {colorName}</h4>

            {isLoading ? (
                <p className="text-right">جاري تحميل المقاسات...</p>
            ) : (
                <ul className="mb-4 space-y-2 text-right">
                    {sizes?.map((size: any) => {

                        return (
                            <li key={size.id} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                                <div className="flex gap-4">
                                    <span>المقاس: {size.sizeName}</span>
                                    <span className="font-bold text-blue-600">الكمية: {size.quantity}</span>
                                </div>

                                {/* زر الحذف */}
                                <button
                                    onClick={() => handleDeleteSize(size.id)}
                                    disabled={deleteSizeMutation.isPending}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                    {deleteSizeMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                                </button>
                            </li>
                        )
                    })}

                    {sizes?.length === 0 && (
                        <p className="text-gray-500 text-sm">لا توجد مقاسات مضافة لهذا اللون بعد.</p>
                    )}
                </ul>
            )}

            <form onSubmit={handleAddSize} className="flex gap-4 items-end border-t pt-4">
                <div>
                    <label className="block text-sm mb-1 text-right">المقاس</label>
                    <input
                        type="text"
                        value={sizeName}
                        onChange={(e) => setSizeName(e.target.value)}
                        placeholder="مثال: XL أو 42"
                        className="border p-2 rounded text-right"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1 text-right">الكمية بالمخزن</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="border p-2 rounded w-24 text-right"
                        required
                        min="0"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded h-[42px] disabled:opacity-50"
                    disabled={addSizeMutation.isPending}
                >
                    {addSizeMutation.isPending ? 'جاري الإضافة...' : 'إضافة مقاس'}
                </button>
            </form>
        </div>
    );
};

export default ProductSizesManager;