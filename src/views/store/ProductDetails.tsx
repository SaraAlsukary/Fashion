import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useProductDetailsStore,
    useGetAllProductsByStore,
    useGetSizesByProductColor,
    useGetSuggestProducts
} from '../../hooks/useStore';
import { useAddToCart } from '../../hooks/useCart';
// 👈 استيراد هوك التعديل بالإضافة للحذف والإضافة
import { useGetComments, useAddComment, useDeleteComment, useUpdateComment } from '../../hooks/useComments';
import toast from 'react-hot-toast';

export default function ProductDetails() {
    const { productId } = useParams<{ productId: string }>();
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    const pId = productId ? parseInt(productId) : null;
    const sId = storeId ? parseInt(storeId) : null;

    const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsByStore(sId);
    const { data: clothingResponse, isLoading: isLoadingClothing } = useProductDetailsStore(pId);

    const product = productsData?.data || productsData;
    const colorVariants = clothingResponse?.data || [];

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

    // حالة النص للتعليق الجديد
    const [commentText, setCommentText] = useState('');

    // 👈 1️⃣ حالات إدارة الـ Modal الخاص بالحذف
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    // 👈 2️⃣ حالات إدارة تعديل التعليق
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentText, setEditCommentText] = useState('');

    useEffect(() => {
        if (colorVariants.length > 0 && !selectedVariantId) {
            setSelectedVariantId(colorVariants[0].id);
        }
    }, [colorVariants, selectedVariantId]);

    const selectedVariant = colorVariants.find((v: any) => v.id === selectedVariantId) || colorVariants[0];
    const currentImage = selectedVariant?.image || product?.image || '/placeholder-product.png';

    const { data: sizesResponse, isLoading: isLoadingSizes } = useGetSizesByProductColor(pId, selectedVariant?.color || null);
    const { data: suggestionsResponse, isLoading: isLoadingSuggestions } = useGetSuggestProducts(pId);

    const availableSizes = sizesResponse?.data || [];
    const suggestedProducts = suggestionsResponse?.data || [];

    // جلب التعليقات والدوال
    const { data: commentsResponse, isLoading: isLoadingComments } = useGetComments({
        productId: pId || 0,
        pageNumber: 1,
        pageSize: 10
    });
    const comments = commentsResponse?.data || [];
    const addCommentMutation = useAddComment(pId || 0);
    const deleteCommentMutation = useDeleteComment(pId || 0);
    // 👈 3️⃣ هوك تعديل التعليق
    const updateCommentMutation = useUpdateComment(pId || 0);

    const handleColorChange = (variantId: number) => {
        setSelectedVariantId(variantId);
        setSelectedSizeId(null);
    };

    const addToCartMutation = useAddToCart();

    const handleAddToCart = () => {
        if (!selectedSizeId) {
            alert("الرجاء اختيار المقاس أولاً!");
            return;
        }

        const payload = {
            quantity: quantity,
            productSizeId: selectedSizeId
        };

        addToCartMutation.mutate(payload, {
            onError: (error) => {
                console.error("خطأ أثناء الإضافة:", error);
                toast.error("❌ عذراً، فشل إضافة المنتج.");
            }
        });
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !pId) return;

        addCommentMutation.mutate({
            content: commentText,
            productId: pId
        }, {
            onSuccess: () => setCommentText('')
        });
    };

    // 👈 دالة فتح مودال الحذف
    const openDeleteModal = (id: number) => {
        setCommentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // 👈 دالة تأكيد الحذف من داخل المودال
    const confirmDelete = () => {
        if (commentToDelete) {
            deleteCommentMutation.mutate(commentToDelete, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCommentToDelete(null);
                }
            });
        }
    };

    // 👈 دالة تفعيل وضع التعديل لتعليق معين
    const startEditing = (id: number, text: string) => {
        setEditingCommentId(id);
        setEditCommentText(text);
    };

    // 👈 دالة حفظ التعديل
    const handleUpdateComment = (id: number) => {
        if (!editCommentText.trim()) return;
        updateCommentMutation.mutate({
            commentId: id,
            content: editCommentText
        }, {
            onSuccess: () => {
                setEditingCommentId(null); // إغلاق وضع التعديل بعد النجاح
                setEditCommentText('');
            }
        });
    };

    if (isLoadingProducts || isLoadingClothing) {
        return (
            <div className="flex justify-center items-center py-32 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moda-purple"></div>
                <span className="mr-3 font-medium">جاري تحميل تفاصيل المنتج...</span>
            </div>
        );
    }

    if (!product) return <div className="text-center py-32 text-red-500 font-bold">عذراً، لم يتم العثور على المنتج المطلوب.</div>;

    const hasDiscount = product.discountPercentage !== null && product.discountPercentage > 0;

    return (
        <div className="container mx-auto px-6 py-12 relative">
            <button
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-moda-purple transition-colors"
            >
                <span>→</span> العودة للخلف
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                {/* القسم الأيمن: صورة المنتج */}
                <div className="space-y-4">
                    <div className="h-[400px] md:h-[550px] w-full bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
                        <img
                            src={currentImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-opacity duration-500"
                        />
                        {hasDiscount && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-md">
                                خصم {product.discountPercentage}%
                            </div>
                        )}
                    </div>
                </div>

                {/* القسم الأيسر: تفاصيل المنتج */}
                <div className="flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-moda-purple bg-moda-purple/10 px-3 py-1 rounded-full">
                                القسم الحالي #{product.categoryId}
                            </span>
                            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-md text-xs font-bold">
                                <span>★</span>
                                <span>{product.rating > 0 ? product.rating : "جديد"}</span>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">{product.name}</h1>
                        <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                            {hasDiscount ? (
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 line-through">
                                        {(product?.price)?.toLocaleString() || 0} ل.س
                                    </span>
                                    <span className="text-2xl font-black text-red-500">
                                        {(product?.priceAfterDiscount)?.toLocaleString() || 0} ل.س
                                    </span>
                                </div>
                            ) : (
                                <span className="text-2xl font-black text-gray-900">
                                    {(product?.price)?.toLocaleString() || 0} ل.س
                                </span>
                            )}
                        </div>

                        {colorVariants.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-bold text-gray-900">اللون المتاح: <span className="text-moda-purple">{selectedVariant?.color}</span></h3>
                                <div className="flex items-center gap-3">
                                    {colorVariants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => handleColorChange(variant.id)}
                                            title={variant.color}
                                            className={`w-12 h-12 rounded-xl overflow-hidden transition-all duration-200 relative ${selectedVariantId === variant.id
                                                ? 'ring-2 ring-offset-2 ring-moda-purple scale-110 shadow-md'
                                                : 'border border-gray-200 hover:scale-105 opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={variant.image} alt={variant.color} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-2 min-h-[80px]">
                            <h3 className="text-sm font-bold text-gray-900">المقاس (Size):</h3>
                            {isLoadingSizes ? (
                                <div className="text-xs text-gray-500 animate-pulse">جاري جلب المقاسات لهذا اللون...</div>
                            ) : availableSizes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((sizeObj: any) => {
                                        const isAvailable = sizeObj.isFoundProduct;
                                        return (
                                            <button
                                                key={sizeObj.productSizeId}
                                                disabled={!isAvailable}
                                                onClick={() => setSelectedSizeId(sizeObj.productSizeId)}
                                                className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all duration-200 ${!isAvailable
                                                    ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed line-through'
                                                    : selectedSizeId === sizeObj.productSizeId
                                                        ? 'border-moda-purple bg-moda-purple text-white shadow-sm'
                                                        : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
                                                    }`}
                                            >
                                                {sizeObj.size}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-xs text-red-400">لا توجد مقاسات متوفرة لهذا اللون حالياً.</div>
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                            <h3 className="text-sm font-bold text-gray-900">الكمية:</h3>
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 w-max rounded-xl p-1">
                                <button
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 rounded-lg"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-bold text-sm text-gray-800">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 rounded-lg"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                        <button
                            disabled={!selectedSizeId || addToCartMutation.isPending}
                            onClick={handleAddToCart}
                            className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 text-center ${!selectedSizeId
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : addToCartMutation.isPending
                                    ? 'bg-purple-400 text-white cursor-wait'
                                    : 'bg-moda-purple text-white hover:bg-moda-purpleHover'
                                }`}
                        >
                            {addToCartMutation.isPending ? 'جاري الإضافة... ⏳' : selectedSizeId ? 'إضافة إلى سلة التسوق 🛒' : 'الرجاء اختيار المقاس أولاً'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 💬 قسم التعليقات */}
            <div className="mt-12 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-6 border-r-4 border-moda-purple pr-3">
                    آراء وتعلـيقات العملاء ({comments.length})
                </h2>

                <form onSubmit={handleAddComment} className="mb-8 space-y-3">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="اكتب مراجعتك أو تعليقك حول المنتج هنا..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-moda-purple/20 focus:border-moda-purple transition-all resize-none"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!commentText.trim() || addCommentMutation.isPending}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${!commentText.trim() || addCommentMutation.isPending
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-moda-purple text-white hover:bg-moda-purpleHover active:scale-95'
                                }`}
                        >
                            {addCommentMutation.isPending ? 'جاري النشر... ⏳' : 'نشر التعليق 🚀'}
                        </button>
                    </div>
                </form>

                {isLoadingComments ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2].map(n => <div key={n} className="h-20 bg-gray-50 rounded-2xl"></div>)}
                    </div>
                ) : comments.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pl-2">
                        {comments.map((comment: any) => (
                            <div key={comment.commentId} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-start justify-between gap-4 group">
                                <div className="flex gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-moda-purple/10 text-moda-purple flex items-center justify-center font-black text-sm uppercase shrink-0">
                                        {comment.userFullName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex justify-between items-center w-full">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{comment.userFullName}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(comment.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {comment.updatedAt && ' (مُعدل)'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 👈 واجهة التعديل أو عرض النص */}
                                        {editingCommentId === comment.commentId ? (
                                            <div className="mt-3 w-full">
                                                <textarea
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-moda-purple resize-none"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleUpdateComment(comment.commentId)}
                                                        disabled={updateCommentMutation.isPending}
                                                        className="px-3 py-1.5 bg-moda-purple text-white text-xs font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                                                    >
                                                        {updateCommentMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        disabled={updateCommentMutation.isPending}
                                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                                    >
                                                        إلغاء
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">{comment.text}</p>
                                        )}
                                    </div>
                                </div>

                                {/* 👈 أزرار التعديل والحذف (تظهر فقط إذا لم يكن التعليق في وضع التعديل) */}
                                {editingCommentId !== comment.commentId && (
                                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                                        <button
                                            onClick={() => startEditing(comment.commentId, comment.text)}
                                            className="text-gray-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                            title="تعديل التعليق"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(comment.commentId)}
                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            title="حذف التعليق"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">لا توجد تعليقات على هذا المنتج بعد. كن أول من يعلق!</div>
                )}
            </div>

            {/* قسم المنتجات المقترحة */}
            <div className="mt-16">
                <h2 className="text-2xl font-black text-gray-900 mb-6 border-r-4 border-moda-purple pr-3">قد يعجبك أيضاً</h2>
                {isLoadingSuggestions ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4].map(skeleton => <div key={skeleton} className="min-w-[200px] h-64 bg-gray-100 animate-pulse rounded-2xl"></div>)}
                    </div>
                ) : suggestedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {suggestedProducts.map((suggested: any) => (
                            <div
                                key={suggested.id}
                                onClick={() => navigate(`/stores/${storeId}/products/${suggested.productId}/`)}
                                className="group cursor-pointer bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-lg transition-all"
                            >
                                <div className="h-48 w-full bg-gray-50 rounded-xl overflow-hidden mb-3">
                                    <img
                                        src={suggested.imageUrl || '/placeholder-product.png'}
                                        alt={suggested.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{suggested.name}</h3>
                                <p className="text-moda-purple font-black mt-1">{suggested.price?.toLocaleString()} ل.س</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm">لا توجد منتجات مقترحة حالياً.</div>
                )}
            </div>

            {/* 🛑 Modal تأكيد الحذف */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl transform transition-all scale-100">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-xl">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-black text-center text-gray-900 mb-2">تأكيد الحذف</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            هل أنت متأكد أنك تريد حذف هذا التعليق نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={deleteCommentMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteCommentMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {deleteCommentMutation.isPending ? 'جاري الحذف...' : 'حذف التعليق'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}