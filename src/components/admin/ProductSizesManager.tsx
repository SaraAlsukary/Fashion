import React, { useState } from 'react';
import { useGetSizesByColor, useAddSizesForProduct } from '../../hooks/useClothingItem';

const ProductSizesManager = ({ productId, colorName, productColorId }: { productId: number, colorName: string, productColorId: number }) => {
    // جلب المقاسات المرتبطة بالمنتج واللون
    const { data: sizes, isLoading } = useGetSizesByColor(productId, colorName);
    const addSizeMutation = useAddSizesForProduct();

    const [sizeName, setSizeName] = useState('');
    const [quantity, setQuantity] = useState(0);

    const handleAddSize = (e: React.FormEvent) => {
        e.preventDefault();

        // يفترض أن الـ Body يحتاج قائمة أو كائن للمقاسات حسب تصميم الـ API الخاص بك
        const sizeData = {
            sizeName,
            stockQuantity: quantity
        };

        addSizeMutation.mutate({ productColorId, sizesData: sizeData }, {
            onSuccess: () => {
                alert('تمت إضافة المقاس بنجاح');
                setSizeName('');
                setQuantity(0);
            }
        });
    };

    return (
        <div className="p-4 border rounded-lg mt-4 bg-white">
            <h4 className="font-bold mb-4">المقاسات المتاحة للون: {colorName}</h4>

            {isLoading ? (
                <p>جاري تحميل المقاسات...</p>
            ) : (
                <ul className="mb-4 space-y-2 text-right">
                    {sizes?.map((size: any) => (
                        <li key={size.id} className="bg-gray-100 p-2 rounded flex justify-between">
                            <span>المقاس: {size.sizeName}</span>
                            <span className="font-bold">الكمية: {size.stockQuantity}</span>
                        </li>
                    ))}
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
                        className="border p-2 rounded" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1 text-right">الكمية بالمخزن</label>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))} 
                        className="border p-2 rounded w-24" 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className="bg-green-600 text-white px-4 py-2 rounded h-[42px]"
                    disabled={addSizeMutation.isPending}
                >
                    {addSizeMutation.isPending ? '...' : 'إضافة مقاس'}
                </button>
            </form>
        </div>
    );
};

export default ProductSizesManager;