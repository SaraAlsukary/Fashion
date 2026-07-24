import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProduct } from '../../hooks/useProduct'; // تأكد من استيراد الهوك الخاص بالتعديل
// import { useGetProductById } from '../../hooks/useProduct'; // ستحتاج لهذا الهوك لجلب بيانات المنتج الحالي
import { useCategory } from '../../hooks/useCategory';
import { useGetStoreCategories } from '../../hooks/useStoreCategory';
import toast from 'react-hot-toast';

// دالة مساعدة لتنسيق التاريخ ليناسب حقل datetime-local
const formatForDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    // تحويل التاريخ ليتناسب مع صيغة YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
};

const ProductEditPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // جلب الـ id من مسار الرابط

    // 1. هوك التعديل
    const updateProductMutation = useUpdateProduct();

    // 2. جلب بيانات المنتج المراد تعديله (يرجى التأكد من مسار واسم الهوك لديك)
    // const { data: productDetails, isLoading: isLoadingProduct } = useGetProductById(Number(id));

    // *ملاحظة مؤقتة: إذا لم يكن لديك هوك للجلب، يمكنك تمرير البيانات عبر الـ state في React Router*
    const productDetails: any = {}; // استبدل هذا ببيانات المنتج الحقيقية القادمة من الـ API

    // 3. جلب الفئات
    const { categories: globalCategories, loading: isLoadingGlobalCategories } = useCategory();
    const { data: storeCategories, isLoading: isLoadingStoreCategories } = useGetStoreCategories();

    const availableCategories = storeCategories?.map((storeCat: any) => {
        const matchedCategory = globalCategories?.find((gCat: any) => gCat.id === storeCat.categoryId);
        return {
            categoryId: storeCat.categoryId,
            name: matchedCategory ? matchedCategory.name : `فئة غير معروفة (${storeCat.categoryId})`
        };
    }) || [];

    const isLoadingCategories = isLoadingGlobalCategories || isLoadingStoreCategories;

    // حالة الحقول
    const [formDataState, setFormDataState] = useState({
        Name: '',
        Description: '',
        Price: '',
        Season: 'Summer',
        Gender: 'Male',
        Type: 'Shirt',
        CategoryId: '',
        DiscountPrecentage: '',
        DiscountStartDate: '',
        DiscountEndDate: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    // تعبئة البيانات عندما تكون متاحة
    useEffect(() => {
        if (productDetails && Object.keys(productDetails).length > 0) {
            setFormDataState({
                Name: productDetails.name || '',
                Description: productDetails.description || '',
                Price: productDetails.price || '',
                Season: productDetails.season || 'Summer',
                Gender: productDetails.gender || 'Male',
                Type: productDetails.type || 'Shirt',
                CategoryId: productDetails.categoryId || '',
                DiscountPrecentage: productDetails.discountPercentage || '',
                DiscountStartDate: formatForDateTimeLocal(productDetails.discountStartDate),
                DiscountEndDate: formatForDateTimeLocal(productDetails.discountEndDate)
            });
        }
    }, [productDetails]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormDataState({ ...formDataState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formDataState.CategoryId) {
            alert('الرجاء اختيار فئة للمنتج');
            return;
        }

        const formData = new FormData();

        // إضافة الحقول النصية والرقمية
        Object.entries(formDataState).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formData.append(key, value as string);
            }
        });

        // إضافة الصورة فقط إذا قام المستخدم باختيار صورة جديدة
        if (imageFile) {
            formData.append('Image', imageFile);
        }

        // استدعاء دالة التعديل وتمرير الـ id والبيانات
        updateProductMutation.mutate({ productId: Number(id), formData }, {
            onSuccess: () => {
                toast.success('تم تعديل المنتج بنجاح!');
                navigate('/admin/products');
            },
            onError: () => {
                toast.error('حدث خطأ أثناء تعديل المنتج');
            }
        });
    };

    // if (isLoadingProduct) {
    //     return <div className="p-6 text-center text-gray-600 font-medium">جاري تحميل بيانات المنتج...</div>;
    // }

    return (
        <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">تعديل المنتج</h1>

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
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">وصف المنتج *</label>
                    <textarea name="Description" required value={formDataState.Description} onChange={handleChange} rows={3} className="w-full border p-2 rounded"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">تغيير صورة المنتج (اختياري)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full border p-2 rounded"
                    // تم إزالة required لأننا في حالة التعديل، الصورة القديمة موجودة مسبقاً
                    />
                    <p className="text-xs text-gray-500 mt-1">اترك هذا الحقل فارغاً إذا كنت لا ترغب بتغيير الصورة الحالية.</p>
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
                    <button type="submit" disabled={updateProductMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50">
                        {updateProductMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEditPage;