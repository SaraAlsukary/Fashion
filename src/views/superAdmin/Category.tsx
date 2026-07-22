import React, { useState } from 'react';
import { useCategory } from '../../hooks/useCategory'; 

// 1. إضافة واجهة لتعريف نوع البيانات (TypeScript Interface)
interface CategoryItem {
    id: number;
    name: string;
}

const Category = () => {
    // جلب البيانات والدوال من React Query Hook
    const { categories, loading, error, addCategory, deleteCategory } = useCategory();
    
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // معالجة إضافة فئة
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsSubmitting(true);
        const success = await addCategory(newCategoryName);
        if (success) {
            setNewCategoryName(''); // تفريغ الحقل بعد الإضافة بنجاح
        }
        setIsSubmitting(false);
    };

    // معالجة حذف فئة
    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`هل أنت متأكد من حذف الفئة: ${name}؟`)) {
            await deleteCategory(id);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة الفئات</h1>

            {/* رسالة الخطأ إن وجدت */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* قسم إضافة فئة جديدة */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">إضافة فئة جديدة</h2>
                <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم الفئة
                        </label>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="مثال: إلكترونيات، ملابس رجالية..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !newCategoryName.trim() || loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">جاري...</span>
                        ) : (
                            'إضافة'
                        )}
                    </button>
                </form>
            </div>

            {/* قسم عرض الفئات */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">قائمة الفئات الحالية</h2>
                    {loading && !isSubmitting && (
                        <span className="text-sm text-blue-500 animate-pulse">يتم التحديث...</span>
                    )}
                </div>
                
                {/* 2. استخدام الواجهة مع المصفوفة */}
                {loading && categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">جاري تحميل الفئات...</div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">لا توجد فئات مضافة حتى الآن.</div>
                ) : (
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="px-6 py-3 font-medium"># المعرف (ID)</th>
                                <th className="px-6 py-3 font-medium">اسم الفئة</th>
                                <th className="px-6 py-3 font-medium text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.map((category: CategoryItem) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">{category.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{category.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(category.id, category.name)}
                                            disabled={loading}
                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Category;