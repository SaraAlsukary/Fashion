import { useNavigate } from 'react-router-dom';
import { useGetAllProductsByStore } from '../../../hooks/useStore';

interface Props {
    storeId: number;
}

export default function StoreProducts({ storeId }: Props) {
    const navigate = useNavigate();
    const { data: productsData, isLoading } = useGetAllProductsByStore(storeId);
    
    const products = productsData?.data || (Array.isArray(productsData) ? productsData : []);

    // دالة تحويل رابط الصورة إلى HTTPS عبر Proxy
    const getSecureImageUrl = (imagePath: string | null) => {
        if (!imagePath) return '/placeholder-product.png';
        if (imagePath.startsWith('https://')) return imagePath;

        // بناء الرابط الكامل إن لم يكن مكتملاً
        const rawUrl = imagePath.startsWith('http://')
            ? imagePath
            : `http://www.marketexpress.somee.com/${imagePath.replace(/^\//, '')}`;

        // تحويل الرابط ليمر عبر wsrv.nl بالـ HTTPS
        return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}`;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="bg-gray-100 animate-pulse h-80 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-500">
                <div className="text-4xl mb-3">🛍️</div>
                <p className="font-bold text-lg">لا توجد منتجات متاحة</p>
                <p className="text-sm">لم يقم هذا المتجر بإضافة أي منتجات حتى الآن.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">المنتجات ({products.length})</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product: any) => {
                    const hasDiscount = product.discountPercentage !== null && product.discountPercentage > 0;

                    return (
                        <div
                            key={product.id}
                            onClick={() => navigate(`products/${product.id}`)} 
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                        >
                            <div className="h-64 bg-gray-50 relative overflow-hidden">
                                <img
                                    src={getSecureImageUrl(product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        // صورة بديلة في حال فشل التحميل
                                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                    }}
                                />
                                {hasDiscount && (
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                        خصم {product.discountPercentage}%
                                    </div>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-grow space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{product.name}</h4>
                                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            <span>★</span>
                                            <span>{product.rating > 0 ? product.rating : "جديد"}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                                </div>

                                <div className="flex justify-between items-end pt-3 border-t border-gray-50 mt-auto">
                                    <div className="flex flex-col">
                                        {hasDiscount ? (
                                            <>
                                                <span className="text-[10px] text-gray-400 line-through">{product.price} ل.س</span>
                                                <span className="text-base font-black text-red-500">{product.priceAfterDiscount} ل.س</span>
                                            </>
                                        ) : (
                                            <span className="text-base font-black text-gray-900">{product.price} ل.س</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`products/${product.id}`);
                                            }}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-xl transition-all"
                                        >
                                            عرض 👁️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`products/${product.id}`);
                                            }}
                                            className="bg-moda-purple hover:bg-moda-purpleHover text-white text-xs font-medium py-2 px-3 rounded-xl transition-all shadow-sm"
                                        >
                                            + 🛒
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}