import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useProductDetailsStore,
    useGetAllProductsByStore,
    useGetSizesByProductColor,
    useGetSuggestProducts
} from '../../hooks/useStore';
import { useAddToCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

// استيراد المكونات الفرعية الجديدة 🚀
import ProductRatingSection from '../../components/product/ProductRatingSection';
import CommentsSection from '../../components/product/CommentsSection';

export default function ProductDetails() {
    const { productId, storeId } = useParams<{ productId: string; storeId: string }>();
    const navigate = useNavigate();

    const pId = productId ? parseInt(productId) : null;
    const sId = storeId ? parseInt(storeId) : null;

  
    const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsByStore(sId);
    const { data: clothingResponse, isLoading: isLoadingClothing } = useProductDetailsStore(pId);

    // 👈 التعديل هنا: البحث عن المنتج المحدد داخل مصفوفة المنتجات
    const productsList = productsData?.data || productsData || [];
    const product = Array.isArray(productsList)
        ? productsList.find((p: any) => p.id === pId || p.productId === pId)
        : productsList;

    const colorVariants = clothingResponse?.data || [];

    // 👈 استخراج التقييم بجميع مسمياته المتوقعة من الـ API لضمان عدم قراءة undefined
    const productRating = product?.rating ?? product?.averageRating ?? product?.rate ?? 0;
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

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
    const addToCartMutation = useAddToCart();

    const handleColorChange = (variantId: number) => {
        setSelectedVariantId(variantId);
        setSelectedSizeId(null);
    };

    const handleAddToCart = () => {
        if (!selectedSizeId) {
            toast.error("الرجاء اختيار المقاس أولاً!");
            return;
        }

        addToCartMutation.mutate({
            quantity: quantity,
            productSizeId: selectedSizeId
        }, {
            onError: (error) => {
                console.error("خطأ أثناء الإضافة:", error);
                toast.error("❌ عذراً، فشل إضافة المنتج.");
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
                        <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
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
                                <span>{productRating > 0 ? productRating : "جديد"}</span>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">{product.name}</h1>
                        <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                            {hasDiscount ? (
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 line-through">{(product?.price)?.toLocaleString()} ل.س</span>
                                    <span className="text-2xl font-black text-red-500">{(product?.priceAfterDiscount)?.toLocaleString()} ل.س</span>
                                </div>
                            ) : (
                                <span className="text-2xl font-black text-gray-900">{(product?.price)?.toLocaleString()} ل.س</span>
                            )}
                        </div>

                        {/* الألوان */}
                        {colorVariants.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-bold text-gray-900">اللون المتاح: <span className="text-moda-purple">{selectedVariant?.color}</span></h3>
                                <div className="flex items-center gap-3">
                                    {colorVariants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => handleColorChange(variant.id)}
                                            className={`w-12 h-12 rounded-xl overflow-hidden transition-all ${selectedVariantId === variant.id ? 'ring-2 ring-offset-2 ring-moda-purple scale-110 shadow-md' : 'opacity-70 border'}`}
                                        >
                                            <img src={variant.image} alt={variant.color} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* المقاسات */}
                        <div className="space-y-3 pt-2 min-h-[80px]">
                            <h3 className="text-sm font-bold text-gray-900">المقاس (Size):</h3>
                            {isLoadingSizes ? (
                                <div className="text-xs text-gray-500 animate-pulse">جاري جلب المقاسات...</div>
                            ) : availableSizes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((sizeObj: any) => (
                                        <button
                                            key={sizeObj.productSizeId}
                                            disabled={!sizeObj.isFoundProduct}
                                            onClick={() => setSelectedSizeId(sizeObj.productSizeId)}
                                            className={`px-4 py-2 text-xs font-bold border rounded-xl ${!sizeObj.isFoundProduct ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' : selectedSizeId === sizeObj.productSizeId ? 'bg-moda-purple text-white' : 'bg-white'}`}
                                        >
                                            {sizeObj.size}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-red-400">لا توجد مقاسات متوفرة.</div>
                            )}
                        </div>

                        {/* الكمية */}
                        <div className="space-y-3 pt-2">
                            <h3 className="text-sm font-bold text-gray-900">الكمية:</h3>
                            <div className="flex items-center gap-3 bg-gray-50 border w-max rounded-xl p-1">
                                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="w-8 h-8 font-bold">-</button>
                                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                                <button onClick={() => setQuantity(prev => prev + 1)} className="w-8 h-8 font-bold">+</button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                        <button
                            disabled={!selectedSizeId || addToCartMutation.isPending}
                            onClick={handleAddToCart}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${!selectedSizeId ? 'bg-gray-100 text-gray-400' : 'bg-moda-purple text-white'}`}
                        >
                            {addToCartMutation.isPending ? 'جاري الإضافة... ⏳' : selectedSizeId ? 'إضافة إلى سلة التسوق 🛒' : 'الرجاء اختيار المقاس أولاً'}
                        </button>

                        {/* استدعاء قسم التقييم المعزول 🌟 */}
                        {pId && <ProductRatingSection productId={pId} />}
                    </div>
                </div>
            </div>

            {/* استدعاء قسم التعليقات المعزول 💬 */}
            {pId && <CommentsSection productId={pId} />}

            {/* قسم المنتجات المقترحة */}
            <div className="mt-16">
                <h2 className="text-2xl font-black text-gray-900 mb-6 border-r-4 border-moda-purple pr-3">قد يعجبك أيضاً</h2>
                {isLoadingSuggestions ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4].map(s => <div key={s} className="min-w-[200px] h-64 bg-gray-100 animate-pulse rounded-2xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {suggestedProducts.map((suggested: any) => (
                            <div key={suggested.productId} onClick={() => navigate(`/stores/${storeId}/products/${suggested.productId}/`)} className="group cursor-pointer bg-white border rounded-2xl p-3 hover:shadow-lg transition-all">
                                <div className="h-48 w-full bg-gray-50 rounded-xl overflow-hidden mb-3">
                                    <img src={suggested.imageUrl || '/placeholder-product.png'} alt={suggested.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{suggested.name}</h3>
                                <p className="text-moda-purple font-black mt-1">{suggested.price?.toLocaleString()} ل.س</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}