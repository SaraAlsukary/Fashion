import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useProductDetailsStore,
    useGetAllProductsByStore,
    useGetSizesByProductColor, // الـ Hook الجديد
    useGetSuggestProducts      // الـ Hook الجديد
} from '../../hooks/useStore';
import { useAddToCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';
export default function ProductDetails() {
    const { productId } = useParams<{ productId: string }>();
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    const pId = productId ? parseInt(productId) : null;
    const sId = storeId ? parseInt(storeId) : null;

    // 1️⃣ جلب تفاصيل المنتج الأساسية والألوان
    const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsByStore(sId);
    const { data: clothingResponse, isLoading: isLoadingClothing } = useProductDetailsStore(pId);

    const product = productsData?.data || productsData;
    const colorVariants = clothingResponse?.data || [];

    // حالات الاختيار التفاعلية
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
    // تحديد اللون الافتراضي عند تحميل البيانات لأول مرة
    useEffect(() => {
        if (colorVariants.length > 0 && !selectedVariantId) {
            setSelectedVariantId(colorVariants[0].id);
        }
    }, [colorVariants, selectedVariantId]);

    // استخراج بيانات اللون المحدد حالياً لتحديث الصورة واللون المرسل للـ API
    const selectedVariant = colorVariants.find((v: any) => v.id === selectedVariantId) || colorVariants[0];
    const currentImage = selectedVariant?.image || product?.image || '/placeholder-product.png';

    // 2️⃣ جلب المقاسات والمنتجات المقترحة باستخدام الـ Hooks الجديدة بأسلوب React Query المختصر
    const { data: sizesResponse, isLoading: isLoadingSizes } = useGetSizesByProductColor(pId, selectedVariant?.color || null);
    const { data: suggestionsResponse, isLoading: isLoadingSuggestions } = useGetSuggestProducts(pId);

    const availableSizes = sizesResponse?.data || [];
    const suggestedProducts = suggestionsResponse?.data || [];

    // دالة تغيير اللون (وتفريغ المقاس المحدد مسبقاً)
    const handleColorChange = (variantId: number) => {
        setSelectedVariantId(variantId);
        setSelectedSizeId(null);
    };
    // 👈 استدعاء هيدر الإضافة للسلة من React Query
  // هذا هو الـ productSizeId

    const addToCartMutation = useAddToCart();

    const handleAddToCart = () => {
        if (!selectedSizeId) {
            alert("الرجاء اختيار المقاس أولاً!");
            return;
        }

        // 👈 تجهيز البيانات المطابقة تماماً لـ Swagger الخاص بك
        const payload = {
            quantity: quantity,
            productSizeId: selectedSizeId // نمرر المعرف هنا
        };

        addToCartMutation.mutate(payload, {
            onError: (error) => {
                console.error("خطأ أثناء الإضافة:", error);
                toast.error("❌ عذراً، فشل إضافة المنتج. تحقق من الاتصال.");
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

    if (!product) {
        return <div className="text-center py-32 text-red-500 font-bold">عذراً، لم يتم العثور على المنتج المطلوب.</div>;
    }

    const hasDiscount = product.discountPercentage !== null && product.discountPercentage > 0;

    return (
        <div className="container mx-auto px-6 py-12">
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

                        {/* 🎨 خيار اختيار الألوان */}
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

                        {/* 📏 خيار اختيار المقاسات الديناميكية */}
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

                        {/* التحكم بالكمية */}
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

                    {/* 🛒 أزرار الإجراءات */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                        <button
                            // الزر يكون معطلاً إذا لم يتم اختيار مقاس، أو إذا كانت عملية الإرسال جارية حالياً
                            disabled={!selectedSizeId || addToCartMutation.isPending}
                            onClick={handleAddToCart} // 👈 ربط الدالة هنا عند الضغط
                            className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 text-center ${!selectedSizeId
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : addToCartMutation.isPending
                                    ? 'bg-purple-400 text-white cursor-wait'
                                    : 'bg-moda-purple text-white hover:bg-moda-purpleHover'
                                }`}
                        >
                            {/* تغيير نص الزر ديناميكياً أثناء التحميل */}
                            {addToCartMutation.isPending
                                ? 'جاري الإضافة... ⏳'
                                : selectedSizeId
                                    ? 'إضافة إلى سلة التسوق 🛒'
                                    : 'الرجاء اختيار المقاس أولاً'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎁 قسم المنتجات المقترحة */}
            <div className="mt-16">
                <h2 className="text-2xl font-black text-gray-900 mb-6 border-r-4 border-moda-purple pr-3">
                    قد يعجبك أيضاً
                </h2>

                {isLoadingSuggestions ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4].map(skeleton => (
                            <div key={skeleton} className="min-w-[200px] h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
                        ))}
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
        </div>
    );
}