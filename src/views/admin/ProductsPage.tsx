import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeleteProduct } from '../../hooks/useProduct';
import { useGetStoresByAdmin } from '../../hooks/useStore';
import { getSecureImageUrl } from '../../constant/imageURL';
import { useGetProductDashboard } from '../../hooks/useAdmin';
import ManageVariantsModal from '../../components/admin/ManageVariantsModal';

const ProductsPage = () => {
    // --- حالات الـ Pagination ---
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // حالة للتحكم في نافذة العرض
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // حالة للتحكم في نافذة تأكيد الحذف
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const { data: store, isLoading: isLoadingStores } = useGetStoresByAdmin();
    const { data: products, isLoading: isLoadingProducts } = useGetProductDashboard(pageNumber, pageSize);
    const deleteMutation = useDeleteProduct();

    // --- استخراج بيانات المنتجات والعدد الإجمالي من الـ API ---
    const productList = products?.data?.products || [];
    const totalProductsCount = products?.data?.totalProductsCount || 0;
    const totalPages = Math.ceil(totalProductsCount / pageSize);
    // أضف هذه الحالات في أعلى مكون ProductsPage
    const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
    const [activeProduct, setActiveProduct] = useState<any | null>(null);

    // دالة لفتح النافذة
    const openVariantsModal = (product: any) => {
        setActiveProduct(product);
        setIsVariantsModalOpen(true);
    };
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
            deleteMutation.mutate(productToDelete, {
                onSuccess: () => {
                    if (productList.length === 1 && pageNumber > 1) {
                        setPageNumber(pageNumber - 1);
                    }
                }
            });
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'غير محدد';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // دالة مساعدة لضمان صحة كود اللون (Hex)
    const getValidHex = (hex: string) => {
        if (!hex) return '#cccccc';
        return hex.startsWith('#') ? hex : `#${hex}`;
    };

    // --- دوال الـ Pagination ---
    const handleNextPage = () => {
        if (pageNumber < totalPages) setPageNumber((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (pageNumber > 1) setPageNumber((prev) => prev - 1);
    };

    const navigate = useNavigate();

    if (isLoadingStores || isLoadingProducts) {
        return <div className="p-6 text-center text-gray-600 font-medium">جاري تحميل البيانات...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6 relative">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات - {store?.storeName || 'المتجر'}</h1>
                <Link
                    to="/admin/products/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                    + إضافة منتج جديد
                </Link>
            </div>

            <div className="flex justify-end items-center space-x-2 space-x-reverse mb-4">
                <label className="text-gray-600 text-sm">عرض:</label>
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPageNumber(1);
                    }}
                    className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <span className="text-gray-600 text-sm">منتج</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600">
                            <th className="p-4 border-b font-medium">الصورة</th>
                            <th className="p-4 border-b font-medium">اسم المنتج</th>
                            <th className="p-4 border-b font-medium">السعر</th>
                            <th className="p-4 border-b font-medium">المخزون الكلي</th>
                            <th className="p-4 border-b font-medium">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.map((product: any) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b">
                                    <img src={getSecureImageUrl(product.image)} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                </td>
                                <td className="p-4 border-b font-medium">{product.name}</td>
                                <td className="p-4 border-b">{product.price} $</td>
                                <td className="p-4 border-b">
                                    <span className={`px-2 py-1 rounded text-sm ${product.totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.totalStock}
                                    </span>
                                </td>
                                <td className="p-4 border-b space-x-2 space-x-reverse min-w-[220px]">
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
                                        onClick={() => openVariantsModal(product)} // تمرير كائن المنتج بالكامل هنا
                                        className="cursor-pointer bg-blue-500 text-white px-3 py-1 mx-1 rounded hover:bg-blue-600 transition"
                                    >
                                        إدارة الألوان
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
                        {productList.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">لا توجد منتجات مضافة حتى الآن.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalProductsCount > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-100 text-sm">
                    <div className="text-gray-600 mb-4 md:mb-0">
                        إجمالي المنتجات: <span className="font-bold">{totalProductsCount}</span>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                            onClick={handlePrevPage}
                            disabled={pageNumber === 1}
                            className={`px-4 py-2 rounded transition ${pageNumber === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                                }`}
                        >
                            السابق
                        </button>

                        <span className="px-4 py-2 text-gray-700 font-medium">
                            صفحة {pageNumber} من {totalPages}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={pageNumber === totalPages || totalPages === 0}
                            className={`px-4 py-2 rounded transition ${pageNumber === totalPages || totalPages === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                                }`}
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}

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
                            <p className="text-gray-500 mb-6 text-sm">هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع.</p>
                            <div className="flex justify-center gap-3">
                                <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition w-full flex-1">نعم، احذف</button>
                                <button onClick={closeDeleteModal} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition w-full flex-1">إلغاء</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------ نافذة عرض تفاصيل المنتج (View Modal) ------------ */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">تفاصيل المنتج</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-red-500 transition text-3xl font-bold leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-6">

                            {/* القسم العلوي: الصورة والمعلومات الأساسية */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 flex justify-center">
                                    <img
                                        src={getSecureImageUrl(selectedProduct.image)}
                                        alt={selectedProduct.name}
                                        className="w-48 h-48 object-cover rounded-xl shadow-sm border border-gray-200"
                                    />
                                </div>
                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 block text-sm mb-1">اسم المنتج</span>
                                        <span className="font-semibold text-gray-800">{selectedProduct.name}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 block text-sm mb-1">رقم الفئة</span>
                                        <span className="font-semibold text-gray-800">{selectedProduct.categoryId}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg sm:col-span-2">
                                        <span className="text-gray-500 block text-sm mb-1">الوصف</span>
                                        <span className="font-semibold text-gray-800">{selectedProduct.description || 'لا يوجد وصف'}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 block text-sm mb-1">السعر الأساسي</span>
                                        <span className="font-semibold text-gray-800">{selectedProduct.price} $</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 block text-sm mb-1">التقييم</span>
                                        <span className="font-semibold text-gray-800">{selectedProduct.ratingValue || 0} / 5</span>
                                    </div>
                                </div>
                            </div>

                            {/* قسم الإحصائيات (المخزون والمبيعات) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4 border-gray-100">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                    <span className="text-blue-500 block text-sm mb-1 font-medium">المخزون الكلي</span>
                                    <span className="font-bold text-blue-700 text-lg">{selectedProduct.totalStock}</span>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                                    <span className="text-purple-500 block text-sm mb-1 font-medium">العدد المباع</span>
                                    <span className="font-bold text-purple-700 text-lg">{selectedProduct.soldCount}</span>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-center">
                                    <span className="text-yellow-600 block text-sm mb-1 font-medium">إجمالي المبيعات</span>
                                    <span className="font-bold text-yellow-700 text-lg">{selectedProduct.soldTotalPrice} $</span>
                                </div>
                            </div>

                            {/* تفاصيل الخصم إن وجدت */}
                            {selectedProduct.discountPercentage > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t pt-4 border-gray-100">
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
                                        <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedProduct.discountStartDate)}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 block text-sm mb-1">نهاية الخصم</span>
                                        <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedProduct.discountEndDate)}</span>
                                    </div>
                                </div>
                            )}

                            {/* قسم الألوان والمقاسات التفصيلي */}
                            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                                <div className="border-t pt-4 border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                                        الألوان والمقاسات المتوفرة
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedProduct.colors.map((colorItem: any, index: number) => (
                                            <div key={index} className="bg-white border rounded-xl p-4 shadow-sm">
                                                {/* ترويسة اللون */}
                                                <div className="flex items-center space-x-3 space-x-reverse mb-4 border-b pb-3">
                                                    <div
                                                        className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner"
                                                        style={{ backgroundColor: getValidHex(colorItem.colorHexCode) }}
                                                    ></div>
                                                    <span className="font-bold text-gray-800 text-lg">{colorItem.color}</span>
                                                </div>

                                                {/* المقاسات المرتبطة بهذا اللون */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                    {colorItem.sizes.map((sizeItem: any, idx: number) => (
                                                        <div key={idx} className={`rounded-lg p-3 text-center border ${sizeItem.quantity > 0 ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-100 opacity-70'}`}>
                                                            <div className="font-bold text-gray-800 text-lg mb-1">{sizeItem.size}</div>
                                                            <div className="text-sm text-gray-500">
                                                                الكمية: <span className={`font-bold ${sizeItem.quantity > 0 ? "text-blue-600" : "text-red-500"}`}>{sizeItem.quantity}</span>
                                                            </div>
                                                            {!sizeItem.isFoundProduct && (
                                                                <div className="text-xs text-red-500 mt-1">غير متوفر حالياً</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-2.5 rounded-lg transition font-medium"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------ نافذة إدارة الألوان والمقاسات ------------ */}
            {isVariantsModalOpen && activeProduct && (
                <ManageVariantsModal
                    product={activeProduct}
                    onClose={() => {
                        setIsVariantsModalOpen(false);
                        setActiveProduct(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductsPage;