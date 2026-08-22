import React, { useState } from 'react';
import { 
    useDeleteProductColor, 
    useDeleteProductSize, 
    useAddColorForProduct,
    useAddSizesForProduct 
} from '../../hooks/useClothingItem'; 
import { getSecureImageUrl } from '../../constant/imageURL';
import { useQueryClient } from '@tanstack/react-query';

// ==========================================
// 1. تعريف واجهات البيانات (Interfaces)
// ==========================================

export interface SizeVariant {
    productSizeId: number;
    size: string;
    quantity: number;
}

export interface ColorVariant {
    productColorId: number;
    colorHexCode: string;
    color: string;
    sizes: SizeVariant[];
}

export interface Product {
    id: number;
    name: string;
    image: string;
    colors?: ColorVariant[];
}

interface ManageVariantsModalProps {
    product: Product; // تم استبدال any بـ Product
    onClose: () => void;
}

const SIZE_ENUMS = [
    "XS", "S", "M", "L", "XL", "XXL", 
    "Shoe36", "Shoe37", "Shoe38", "Shoe39", "Shoe40", 
    "Shoe41", "Shoe42", "Shoe43", "Shoe44", "Shoe45"
];

// دالة مساعدة لضمان وجود # في كود اللون
const getValidHex = (hex: string) => {
    if (!hex) return '#cccccc';
    return hex.startsWith('#') ? hex : `#${hex}`;
};

// ==========================================
// 2. المكون الأساسي (Component)
// ==========================================

const ManageVariantsModal: React.FC<ManageVariantsModalProps> = ({ product, onClose }) => {
    const productId = product.id;
    const queryClient = useQueryClient();

    // نعتمد على الألوان القادمة من كائن المنتج مباشرة
    const colorsList: ColorVariant[] = product?.colors || []; 

    const deleteColorMutation = useDeleteProductColor();
    const deleteSizeMutation = useDeleteProductSize();
    const addColorMutation = useAddColorForProduct();
    const addSizeMutation = useAddSizesForProduct();

    // حالات (States) إضافة لون جديد
    const [newColorName, setNewColorName] = useState('');
    const [newColorHex, setNewColorHex] = useState('#000000');
    const [newColorFile, setNewColorFile] = useState<File | null>(null);

    // حالات (States) إضافة مقاس جديد
    const [activeColorIdForSize, setActiveColorIdForSize] = useState<number | null>(null);
    const [newSizeName, setNewSizeName] = useState(SIZE_ENUMS[0]);
    const [newSizeQty, setNewSizeQty] = useState<number | ''>('');

    // تحديث البيانات في الواجهة
    const invalidateProducts = () => {
        queryClient.invalidateQueries({ queryKey: ['productsDashboard'] });
    };

    // ==========================================
    // 3. دوال التعامل مع الأحداث (Handlers)
    // ==========================================

    const handleDeleteColor = (productColorId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا اللون بجميع مقاساته؟')) {
            deleteColorMutation.mutate({ productColorId, productId }, {
                onSuccess: invalidateProducts
            });
        }
    };

    const handleDeleteSize = (productSizeId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقاس؟')) {
            deleteSizeMutation.mutate(productSizeId, {
                onSuccess: invalidateProducts
            });
        }
    };

    const handleAddColor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColorName || !newColorFile || !newColorHex) {
            return alert('يرجى تعبئة جميع بيانات اللون (الاسم، كود اللون، والصورة)');
        }

        const formData = new FormData();
        formData.append('Color', newColorName);
        formData.append('ColorHexCode', newColorHex);
        formData.append('Image', newColorFile);

        addColorMutation.mutate({ productId, formData }, {
            onSuccess: () => {
                setNewColorName('');
                setNewColorHex('#000000');
                setNewColorFile(null);
                invalidateProducts();
                alert('تمت إضافة اللون بنجاح!');
            }
        });
    };

    const handleAddSizeSubmit = (productColorId: number) => {
        if (!newSizeName || newSizeQty === '') {
            return alert('يرجى اختيار المقاس وإدخال الكمية');
        }

        const sizeData = [
            { 
                size: newSizeName, 
                quantity: Number(newSizeQty) 
            }
        ];

        addSizeMutation.mutate({ productColorId, sizesData: sizeData }, {
            onSuccess: () => {
                setNewSizeName(SIZE_ENUMS[0]);
                setNewSizeQty('');
                setActiveColorIdForSize(null);
                invalidateProducts();
                alert('تمت إضافة المقاس بنجاح!');
            }
        });
    };

    // ==========================================
    // 4. واجهة المستخدم (UI)
    // ==========================================

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">

                {/* الترويسة */}
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        {product.image && (
                            <img src={getSecureImageUrl(product.image)} alt={product.name} className="w-10 h-10 object-cover rounded-md border" />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">إدارة الألوان والمقاسات</h2>
                            <p className="text-xs text-gray-500">المنتج: <span className="font-semibold text-gray-700">{product.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-3xl font-bold leading-none">&times;</button>
                </div>

                <div className="p-5 overflow-y-auto space-y-6 flex-grow">
                    
                    {/* نموذج إضافة لون جديد */}
                    <form onSubmit={handleAddColor} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">إضافة لون جديد</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">اسم اللون</label>
                                <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className="w-full border rounded-md p-2 outline-none focus:border-blue-500" placeholder="مثال: أحمر" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">كود اللون (Hex)</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-10 h-10 border rounded-md cursor-pointer" />
                                    <input type="text" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-full border rounded-md p-2 outline-none focus:border-blue-500" dir="ltr" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">صورة اللون</label>
                                <input type="file" onChange={(e) => setNewColorFile(e.target.files ? e.target.files[0] : null)} className="w-full border rounded-md p-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300" accept="image/*" />
                            </div>
                            <button type="submit" disabled={addColorMutation.isPending} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                                {addColorMutation.isPending ? 'جاري الإضافة...' : 'إضافة اللون'}
                            </button>
                        </div>
                    </form>

                    {/* قائمة الألوان الحالية */}
                    <div>
                        <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">الألوان المتوفرة حالياً</h3>

                        {colorsList.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">لا توجد ألوان مضافة لهذا المنتج.</div>
                        ) : (
                            <div className="space-y-4">
                                {colorsList.map((item: ColorVariant) => {
                                    const sizesArray: SizeVariant[] = item.sizes || [];

                                    return (
                                        <div key={item.productColorId} className="border border-gray-200 rounded-lg p-4 shadow-sm relative group">
                                            
                                            {/* زر حذف اللون */}
                                            <button 
                                                onClick={() => handleDeleteColor(item.productColorId)}
                                                className="absolute top-4 left-4 text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="حذف هذا اللون"
                                            >
                                                حذف اللون
                                            </button>
                                            
                                            <div className="flex items-center gap-3 mb-4">
                                                <div 
                                                    className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                                                    style={{ backgroundColor: getValidHex(item.colorHexCode) }}
                                                ></div>
                                                <div className="font-bold text-lg text-gray-800">{item.color}</div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                
                                                {/* زر فتح نموذج المقاسات */}
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-sm font-semibold text-gray-700">المقاسات المتاحة:</span>
                                                    <button 
                                                        onClick={() => setActiveColorIdForSize(activeColorIdForSize === item.productColorId ? null : item.productColorId)}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        + إضافة مقاس
                                                    </button>
                                                </div>

                                                {/* نموذج إضافة مقاس لهذا اللون */}
                                                {activeColorIdForSize === item.productColorId && (
                                                    <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded border border-blue-100 shadow-sm">
                                                        <select 
                                                            value={newSizeName}
                                                            onChange={(e) => setNewSizeName(e.target.value)}
                                                            className="border p-1.5 rounded outline-none text-sm w-1/3"
                                                        >
                                                            {SIZE_ENUMS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        <input 
                                                            type="number" 
                                                            placeholder="الكمية"
                                                            value={newSizeQty}
                                                            onChange={(e) => setNewSizeQty(Number(e.target.value))}
                                                            className="border p-1.5 rounded outline-none text-sm w-1/3"
                                                            min="0"
                                                        />
                                                        <button 
                                                            onClick={() => handleAddSizeSubmit(item.productColorId)}
                                                            disabled={addSizeMutation.isPending}
                                                            className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 w-1/3"
                                                        >
                                                            حفظ المقاس
                                                        </button>
                                                    </div>
                                                )}

                                                {/* عرض المقاسات */}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {sizesArray.map((sizeItem: SizeVariant) => (
                                                        <div key={sizeItem.productSizeId} className="flex items-center bg-white border rounded shadow-sm overflow-hidden">
                                                            <div className="px-3 py-1.5 bg-gray-100 font-bold border-l min-w-[50px] text-center">
                                                                {sizeItem.size}
                                                            </div>
                                                            <div className="px-3 py-1.5 text-sm text-gray-600">
                                                                الكمية: {sizeItem.quantity}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteSize(sizeItem.productSizeId)}
                                                                disabled={deleteSizeMutation.isPending}
                                                                className="px-3 py-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 border-r transition disabled:opacity-50"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {sizesArray.length === 0 && <span className="text-xs text-gray-400">لا يوجد مقاسات بعد</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageVariantsModal;