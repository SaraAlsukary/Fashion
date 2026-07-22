import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetProducts, useDeleteProduct } from '../../hooks/useProduct';
import { useGetStoresByAdmin } from '../../hooks/useStore';

const ProductsPage = () => {
    // حالة للتحكم في النافذة المنبثقة (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // 1. جلب بيانات المتجر (كائن مفرد بناءً على استجابة الـ API)
    const { data: store, isLoading: isLoadingStores } = useGetStoresByAdmin();

    // 2. استخراج الـ id مباشرة من الكائن
    const storeId = store?.id;

    // 3. جلب المنتجات بناءً على رقم المتجر المستخرج
    const { data: products, isLoading: isLoadingProducts } = useGetProducts(storeId);

    const deleteMutation = useDeleteProduct();

    const handleDelete = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            deleteMutation.mutate(id);
        }
    };

    // دالة لفتح المودال وعرض تفاصيل المنتج
    const handleView = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // دالة لإغلاق المودال
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    // دالة لتنسيق التاريخ
    const formatDate = (dateString: string) => {
        if (!dateString) return 'غير محدد';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    const navigate = useNavigate()
    if (isLoadingStores || isLoadingProducts) {
        return <div className="p-6 text-center text-gray-600 font-medium">جاري تحميل البيانات...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6 relative">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات - {store?.storeName}</h1>
                <Link
                    to="/admin/products/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                    + إضافة منتج جديد
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600">
                            <th className="p-4 border-b font-medium">الصورة</th>
                            <th className="p-4 border-b font-medium">اسم المنتج</th>
                            <th className="p-4 border-b font-medium">السعر</th>
                            <th className="p-4 border-b font-medium">التقييم</th>
                            <th className="p-4 border-b font-medium">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.data?.map((product: any) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b">
                                    <img src={`http://www.marketexpress.somee.com/${product.image}`} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                </td>
                                <td className="p-4 border-b font-medium">{product.name}</td>
                                <td className="p-4 border-b">{product.price} $</td>
                                <td className="p-4 border-b">{product.rating}</td>
                                <td className="p-4 border-b space-x-2 space-x-reverse">
                                    {/* زر العرض */}
                                    <button
                                        onClick={() => handleView(product)}
                                        className="cursor-pointer bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600 transition"
                                    >
                                        عرض
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                        className="cursor-pointer bg-gray-200 text-gray-700 px-3 mx-2 py-1 rounded hover:bg-gray-300 transition"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!products?.data || products.data.length === 0) && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">لا توجد منتجات مضافة حتى الآن.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* نافذة عرض تفاصيل المنتج (Modal) */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700/80 bg-opacity-60 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                        {/* هيدر المودال */}
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">تفاصيل المنتج</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-red-500 transition text-2xl font-bold leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* محتوى المودال (قابل للتمرير) */}
                        <div className="p-5 overflow-y-auto space-y-4">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={`http://www.marketexpress.somee.com/${selectedProduct.image}`}
                                    alt={selectedProduct.name}
                                    className="w-48 h-48 object-cover rounded-lg shadow-sm border"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-gray-500 block text-sm mb-1">اسم المنتج</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.name}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-gray-500 block text-sm mb-1">رقم الفئة (Category ID)</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.categoryId}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded md:col-span-2">
                                    <span className="text-gray-500 block text-sm mb-1">الوصف</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.description || 'لا يوجد وصف'}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-gray-500 block text-sm mb-1">السعر الأساسي</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.price} $</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-gray-500 block text-sm mb-1">التقييم</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.rating} / 5</span>
                                </div>

                                {/* تفاصيل الخصم إن وجدت */}
                                {selectedProduct.discountPercentage > 0 && (
                                    <>
                                        <div className="bg-red-50 p-3 rounded border border-red-100">
                                            <span className="text-red-500 block text-sm mb-1">نسبة الخصم</span>
                                            <span className="font-bold text-red-700">{selectedProduct.discountPercentage}%</span>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded border border-green-100">
                                            <span className="text-green-600 block text-sm mb-1">السعر بعد الخصم</span>
                                            <span className="font-bold text-green-700">{selectedProduct.priceAfterDiscount} $</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="text-gray-500 block text-sm mb-1">بداية الخصم</span>
                                            <span className="font-semibold text-gray-800">{formatDate(selectedProduct.discountStartDate)}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="text-gray-500 block text-sm mb-1">نهاية الخصم</span>
                                            <span className="font-semibold text-gray-800">{formatDate(selectedProduct.discountEndDate)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* فوتر المودال */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;