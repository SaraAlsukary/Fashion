import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeleteProduct } from '../../hooks/useProduct'; // افترضنا بقاء نفس دالة الحذف
import { useGetStoresByAdmin } from '../../hooks/useStore';
import { useGetAllDiscountProductByStore } from '../../hooks/useAdmin';
import { getSecureImageUrl } from '../../constant/imageURL';

const DiscountProductsPage = () => {
    // حالة للتحكم في نافذة العرض
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // حالة للتحكم في نافذة تأكيد الحذف
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    // 1. جلب بيانات المتجر (لعرض اسم المتجر في العنوان)
    const { data: store, isLoading: isLoadingStores } = useGetStoresByAdmin();

    // 2. جلب المنتجات المخفضة باستخدام الـ hook المخصص
    const { data: discountProducts, isLoading: isLoadingProducts } = useGetAllDiscountProductByStore();

    const deleteMutation = useDeleteProduct();
    const navigate = useNavigate();

    // --- دوال التحكم في الحذف ---
    const openDeleteModal = (id: number) => {
        setProductToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    const confirmDelete = () => {
        if (productToDelete !== null) {
            deleteMutation.mutate(productToDelete);
            closeDeleteModal();
        }
    };

    // --- دوال التحكم في العرض ---
    const handleView = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

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

    if (isLoadingStores || isLoadingProducts) {
        return <div className="p-6 text-center text-gray-600 font-medium">جاري تحميل البيانات...</div>;
    }

    // افتراض أن البيانات تأتي داخل data.data بناءً على شكل الاستجابة المعتاد
    const productsList = discountProducts?.data || discountProducts || [];

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6 relative">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    المنتجات المخفضة {store?.storeName ? `- ${store.storeName}` : ''}
                </h1>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600">
                            <th className="p-4 border-b font-medium">الصورة</th>
                            <th className="p-4 border-b font-medium">اسم المنتج</th>
                            <th className="p-4 border-b font-medium">السعر الأساسي</th>
                            <th className="p-4 border-b font-medium">الخصم</th>
                            <th className="p-4 border-b font-medium">السعر بعد الخصم</th>
                            <th className="p-4 border-b font-medium">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsList?.map((product: any) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b">
                                    <img src={getSecureImageUrl(product.image)} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                </td>
                                <td className="p-4 border-b font-medium">{product.name}</td>
                                <td className="p-4 border-b line-through text-gray-400">{product.price} $</td>
                                <td className="p-4 border-b text-red-500 font-bold">{product.discountPercentage}%</td>
                                <td className="p-4 border-b text-green-600 font-bold">{product.priceAfterDiscount} $</td>
                                <td className="p-4 border-b space-x-2 space-x-reverse min-w-[200px]">
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
                                        onClick={() => openDeleteModal(product.id)}
                                        className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {productsList.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">لا توجد منتجات مخفضة حتى الآن.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ------------ نافذة تأكيد الحذف (Delete Modal) ------------ */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذه الخطوة بعد التنفيذ.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition duration-200 w-full flex-1"
                                >
                                    نعم، احذف
                                </button>
                                <button
                                    onClick={closeDeleteModal}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition duration-200 w-full flex-1"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------ نافذة عرض تفاصيل المنتج (View Modal) ------------ */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">تفاصيل المنتج المخفض</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-red-500 transition text-3xl font-bold leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={getSecureImageUrl(selectedProduct.image)}
                                    alt={selectedProduct.name}
                                    className="w-48 h-48 object-cover rounded-lg shadow-sm border"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-500 block text-sm mb-1">اسم المنتج</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.name}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-500 block text-sm mb-1">رقم الفئة</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.categoryId}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                                    <span className="text-gray-500 block text-sm mb-1">الوصف</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.description || 'لا يوجد وصف'}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-500 block text-sm mb-1">السعر الأساسي</span>
                                    <span className="font-semibold text-gray-800 line-through">{selectedProduct.price} $</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-500 block text-sm mb-1">التقييم</span>
                                    <span className="font-semibold text-gray-800">{selectedProduct.rating} / 5</span>
                                </div>

                                {/* تفاصيل الخصم (دائماً تظهر هنا لأنها صفحة منتجات مخفضة) */}
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                    <span className="text-red-500 block text-sm mb-1">نسبة الخصم</span>
                                    <span className="font-bold text-red-700">{selectedProduct.discountPercentage}%</span>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                    <span className="text-green-600 block text-sm mb-1">السعر بعد الخصم</span>
                                    <span className="font-bold text-green-700">{selectedProduct.priceAfterDiscount} $</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-500 block text-sm mb-1">بداية الخصم</span>
                                    <span className="font-semibold text-gray-800">{formatDate(selectedProduct.discountStartDate)}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-500 block text-sm mb-1">نهاية الخصم</span>
                                    <span className="font-semibold text-gray-800">{formatDate(selectedProduct.discountEndDate)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
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

export default DiscountProductsPage;