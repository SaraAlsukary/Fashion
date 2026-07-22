import { useState } from 'react';
// استيراد هوك الفئات العامة (الخاص بالنظام)
import { useCategory } from '../../hooks/useCategory'; 
// استيراد هوكات فئات المتجر
import { useGetStoreCategories, useAddStoreCategory, useDeleteStoreCategory } from '../../hooks/useStoreCategory';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
    // 1. جلب الفئات العامة للنظام
    const { categories: globalCategories, loading: isGlobalLoading } = useCategory();

    // 2. جلب فئات المتجر الحالي
    const { data: storeCategories, isLoading: isStoreLoading, isError: isStoreError } = useGetStoreCategories();
    const addMutation = useAddStoreCategory();
    const deleteMutation = useDeleteStoreCategory();

    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCategoryId) return;

        addMutation.mutate(
            { categoryId: Number(selectedCategoryId) },
            {
                onSuccess: () => {
                    setSelectedCategoryId(''); 
                    toast.success('تمت إضافة الفئة لمتجرك.');
                },
                onError: () => {
                    toast.success('حدث خطأ أثناء إضافة الفئة لمتجرك.');
                }
            }
        );
    };

    const handleDelete = (id: number) => {
        if (window.confirm('هل أنت متأكد من إزالة هذه الفئة من متجرك؟')) {
            // نمرر id الخاص بسجل الربط (وليس categoryId)
            deleteMutation.mutate(id, {
                onError: () => {
                    toast.error('لا يمكن إزالة هذه الفئة، ربما تكون مرتبطة بمنتجات.');
                }
            });
        }
    };

    // دالة مساعدة لاستخراج اسم الفئة بناءً على رقمها
    const getCategoryName = (categoryId: number) => {
        if (!globalCategories) return 'غير معروف';
        
        // البحث عن الفئة المطابقة في قائمة الفئات العامة
        const category = globalCategories.find((cat: any) => cat.id === categoryId);
        
        // إرجاع الاسم إذا وجد، أو رسالة بديلة إذا لم يوجد
        return category ? category.name : `فئة غير معروفة (${categoryId})`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">إدارة فئات المتجر</h1>

            {/* نموذج إضافة فئة للمتجر */}
            <div className="bg-gray-50 p-4 rounded-md border">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">إضافة فئة لمتجرك</h2>
                <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">اختر الفئة *</label>
                        <select 
                            required 
                            value={selectedCategoryId} 
                            onChange={(e) => setSelectedCategoryId(e.target.value)} 
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                            disabled={isGlobalLoading || addMutation.isPending}
                        >
                            <option value="" disabled>
                                {isGlobalLoading ? 'جاري تحميل الفئات...' : '-- اختر فئة من القائمة --'}
                            </option>
                            
                            {globalCategories && globalCategories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={addMutation.isPending || !selectedCategoryId}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition h-[42px] disabled:opacity-50"
                    >
                        {addMutation.isPending ? 'جاري الإضافة...' : 'إضافة لمتجري'}
                    </button>
                </form>
            </div>

            {/* عرض فئات المتجر الحالي */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">الفئات المضافة لمتجرك</h2>
                
                {isStoreLoading ? (
                    <div className="text-center py-8 text-gray-500">جاري تحميل فئات متجرك...</div>
                ) : isStoreError ? (
                    <div className="text-center py-8 text-red-500">حدث خطأ أثناء جلب فئات المتجر.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600">
                                    <th className="p-3 border-b w-32">رقم الفئة (ID)</th>
                                    <th className="p-3 border-b">اسم الفئة</th>
                                    <th className="p-3 border-b w-48">تاريخ الإضافة</th>
                                    <th className="p-3 border-b w-32">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storeCategories && storeCategories.length > 0 ? (
                                    storeCategories.map((category: any) => (
                                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 border-b text-gray-500">{category.categoryId}</td>
                                            
                                            {/* استخدام الدالة المساعدة لعرض الاسم */}
                                            <td className="p-3 border-b font-medium text-gray-800">
                                                {isGlobalLoading ? 'جاري التحميل...' : getCategoryName(category.categoryId)}
                                            </td>
                                            
                                            {/* إضافة عمود لتاريخ الإضافة بما أنه متوفر في البيانات */}
                                            <td className="p-3 border-b text-gray-500 text-sm">
                                                {new Date(category.createdAt).toLocaleDateString('ar-EG')}
                                            </td>
                                            
                                            <td className="p-3 border-b">
                                                <button 
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-1 rounded transition border border-red-500 text-sm disabled:opacity-50"
                                                >
                                                    إزالة
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            لم تقم بإضافة أي فئات لمتجرك بعد.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;