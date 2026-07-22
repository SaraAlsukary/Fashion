import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddProduct } from '../../hooks/useProduct';
import { useCategory } from '../../hooks/useCategory'; // الهوك الخاص بالفئات العامة
import { useGetStoreCategories } from '../../hooks/useStoreCategory'; // الهوك الخاص بفئات المتجر
import toast from 'react-hot-toast';

const ProductFormPage = () => {
    const navigate = useNavigate();
    const addProductMutation = useAddProduct();
    
    // 1. جلب الفئات العامة (للحصول على الأسماء)
    const { categories: globalCategories, loading: isLoadingGlobalCategories } = useCategory();
    
    // 2. جلب فئات المتجر الحالي (للحصول على الأرقام المخصصة للمتجر)
    const { data: storeCategories, isLoading: isLoadingStoreCategories } = useGetStoreCategories();

    // 3. دمج البيانات لإنشاء قائمة الفئات المتاحة لهذا المتجر فقط بأسماء واضحة
    const availableCategories = storeCategories?.map((storeCat: any) => {
        // البحث عن الاسم من الفئات العامة
        const matchedCategory = globalCategories?.find((gCat: any) => gCat.id === storeCat.categoryId);
        return {
            categoryId: storeCat.categoryId, // الرقم الذي سنرسله للـ API
            name: matchedCategory ? matchedCategory.name : `فئة غير معروفة (${storeCat.categoryId})`
        };
    }) || [];

    // حالة التحميل الكلية للقوائم
    const isLoadingCategories = isLoadingGlobalCategories || isLoadingStoreCategories;

    // حالات الحقول (States)
    const [formDataState, setFormDataState] = useState({
        Name: '',
        Description: '',
        Price: '',
        Season: 'Summer',
        Gender: 'Male',
        Type: 'Shirt',
        CategoryId: '', // ستبقى فارغة في البداية حتى يختار المستخدم
        DiscountPrecentage: '',
        DiscountStartDate: '',
        DiscountEndDate: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormDataState({ ...formDataState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!imageFile) {
            alert('الرجاء اختيار صورة للمنتج الأولي');
            return;
        }

        if (!formDataState.CategoryId) {
            alert('الرجاء اختيار فئة للمنتج');
            return;
        }

        const formData = new FormData();
        // إضافة الحقول النصية والرقمية
        Object.entries(formDataState).forEach(([key, value]) => {
            if (value !== '') {
                formData.append(key, value as string);
            }
        });
        
        // إضافة الصورة
        formData.append('Image', imageFile);

        addProductMutation.mutate(formData, {
            onSuccess: () => {
                toast.success('تمت إضافة المنتج بنجاح!');
                navigate('/admin/products'); 
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">إضافة منتج جديد</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* البيانات الأساسية */}
                    <div>
                        <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                        <input type="text" name="Name" required value={formDataState.Name} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">السعر *</label>
                        <input type="number" step="0.01" name="Price" required value={formDataState.Price} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    
                    {/* القوائم المنسدلة (Enums) */}
                    <div>
                        <label className="block text-sm font-medium mb-1">الموسم *</label>
                        <select name="Season" value={formDataState.Season} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="Summer">صيفي (Summer)</option>
                            <option value="Winter">شتوي (Winter)</option>
                            <option value="Spring">ربيعي (Spring)</option>
                            <option value="Autumn">خريفي (Autumn)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">الجنس *</label>
                        <select name="Gender" value={formDataState.Gender} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="Male">رجالي</option>
                            <option value="Female">نسائي</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">نوع القطعة *</label>
                        <select name="Type" value={formDataState.Type} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="Shirt">قميص (Shirt)</option>
                            <option value="T_shirt">تيشيرت (T_shirt)</option>
                            <option value="Pants">بنطلون (Pants)</option>
                            <option value="Dress">فستان (Dress)</option>
                            <option value="Skirt">تنورة (Skirt)</option>
                            <option value="Shoes">أحذية (Shoes)</option>
                            <option value="SportSet">طقم رياضي (SportSet)</option>
                        </select>
                    </div>
                    
                    {/* قائمة فئات المتجر فقط */}
                    <div>
                        <label className="block text-sm font-medium mb-1">فئة المنتج *</label>
                        <select 
                            name="CategoryId" 
                            required 
                            value={formDataState.CategoryId} 
                            onChange={handleChange} 
                            className="w-full border p-2 rounded"
                            disabled={isLoadingCategories || availableCategories.length === 0}
                        >
                            <option value="">-- اختر الفئة --</option>
                            {isLoadingCategories ? (
                                <option value="" disabled>جاري تحميل فئات متجرك...</option>
                            ) : availableCategories.length === 0 ? (
                                <option value="" disabled>لم تقم بإضافة فئات لمتجرك بعد</option>
                            ) : (
                                availableCategories.map((category: any) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))
                            )}
                        </select>
                        {availableCategories.length === 0 && !isLoadingCategories && (
                            <p className="text-red-500 text-xs mt-1">يجب إضافة فئات لمتجرك أولاً من شاشة إدارة الفئات.</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">وصف المنتج *</label>
                    <textarea name="Description" required value={formDataState.Description} onChange={handleChange} rows={3} className="w-full border p-2 rounded"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">صورة المنتج الأساسية *</label>
                    <input type="file" accept="image/*" required onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-bold text-gray-700 mb-4">الخصومات (اختياري)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">نسبة الخصم (%)</label>
                            <input type="number" name="DiscountPrecentage" value={formDataState.DiscountPrecentage} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">تاريخ البدء</label>
                            <input type="datetime-local" name="DiscountStartDate" value={formDataState.DiscountStartDate} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                            <input type="datetime-local" name="DiscountEndDate" value={formDataState.DiscountEndDate} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse border-t pt-6">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50 transition">
                        إلغاء
                    </button>
                    <button type="submit" disabled={addProductMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50">
                        {addProductMutation.isPending ? 'جاري الحفظ...' : 'حفظ المنتج'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;