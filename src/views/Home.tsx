import { Link, useNavigate } from 'react-router-dom';
import { useGetAllStores } from '../hooks/useStore';
import { useGetProductsByFollowedStores } from '../hooks/useStoreFollowers'; // 💡 استيراد هوك المنتجات المتابعة (تأكد من المسار)

export default function Home() {
    // جلب المتاجر الموصى بها
    const { data: storesData, isLoading: isLoadingStores } = useGetAllStores();
    const navigate = useNavigate()
    // 💡 جلب منتجات المتاجر التي يتابعها المستخدم
    const { data: followedProductsResponse, isLoading: isLoadingFollowedProducts } = useGetProductsByFollowedStores();
    const followedProducts = followedProductsResponse?.data || [];

    return (
        <>
            {/* 1. الهيدر (أنميشن انزلاق للأسفل) */}
            <section className="animated-hero-bg text-white py-24 px-6 relative shadow-inner">
                <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center gap-6">
                    <span className="animate-fade-in-up delay-100 bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs px-4 py-1.5 rounded-full font-semibold uppercase tracking-wider hover:bg-white/20 transition-colors cursor-default">
                        مرحباً بك في عالم الأناقة الفاخرة ✨
                    </span>
                    <h2 className="animate-fade-in-up delay-200 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wide max-w-4xl mx-auto drop-shadow-lg">
                        اكتشف الموضة من منظور المبدعين والمتاجر المميزة
                    </h2>
                    <p className="animate-fade-in-up delay-300 text-gray-200 text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light drop-shadow-md">
                        منصتك المتكاملة لبيع وشراء أحدث صيحات الموضة. تصفح، تسوق، وعش التجربة الفريدة.
                    </p>
                    <div className="animate-fade-in-up delay-400 pt-6 flex justify-center gap-4">
                        <Link to={'/stores'} className="bg-white text-moda-purple hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            تصفح المتاجر الآن
                        </Link>
                        <Link to={'/auth/join'} className="bg-transparent border border-white/40 hover:border-white hover:bg-white/10 text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300">
                            انضم الينا
                        </Link>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-6 py-16 space-y-20">

                {/* 🌟 القسم الجديد: منتجات من المتاجر التي تتابعها */}
                <section>
                    <div className="animate-fade-in-up flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">جديد المتاجر التي تتابعها ❤️</h2>
                            <p className="text-sm text-moda-grayText mt-1">أحدث المنتجات من متاجرك المفضلة</p>
                        </div>
                    </div>

                    {isLoadingFollowedProducts ? (
                        // حالة التحميل لمنتجات المتاجر المتابعة
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white h-72 rounded-2xl animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : followedProducts.length > 0 ? (
                        // عرض المنتجات
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {followedProducts.map((product: any) => {
                                const hasDiscount = product.discountPercentage !== null && product.discountPercentage > 0;
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => navigate(`/stores/${product.storeId}/products/${product.id}`)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                                    >
                                        {/* قسم الصورة والشارات */}
                                        <div className="h-64 bg-gray-50 relative overflow-hidden">
                                            <img
                                                src={product.image ? product.image.includes('https://res.cloudinary.com') ? product.image : `http://www.marketexpress.somee.com/${product.image}` : '/placeholder-product.png'}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {hasDiscount && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                                    خصم {product.discountPercentage}%
                                                </div>
                                            )}
                                        </div>

                                        {/* قسم التفاصيل */}
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

                                                {/* أزرار التحكم: زر "عرض" وزر السلة */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/stores/${product.storeId}/products/${product.id}`);
                                                        }}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-xl transition-all"
                                                    >
                                                        عرض 👁️
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/stores/${product.storeId}/products/${product.id}`);

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
                    ) : (
                        // في حال لم يكن يتابع أي متجر أو لا توجد منتجات
                        <div className="animate-fade-in-up bg-gray-50/50 rounded-2xl border border-gray-100 p-8 text-center">
                            <div className="text-4xl mb-3">🛍️</div>
                            <h3 className="text-gray-800 font-bold mb-2">لا توجد منتجات حالياً</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                قم بمتابعة المزيد من المتاجر لرؤية أحدث منتجاتها هنا.
                            </p>
                            <Link to={'/stores'} className="inline-block px-6 py-2 bg-moda-purple text-white rounded-full text-sm font-bold hover:bg-moda-purpleHover transition-colors">
                                استكشف المتاجر
                            </Link>
                        </div>
                    )}
                </section>

                {/* 3. قسم المتاجر الموصى بها */}
                <section>
                    <div className="animate-fade-in-up flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">متاجر موصى بها</h2>
                            <p className="text-sm text-moda-grayText mt-1">متاجر متميزة تم اختيارها لك بعناية</p>
                        </div>
                        <Link to={'stores'} className="text-moda-purple hover:text-moda-purpleHover text-sm font-bold flex items-center gap-2 transition-all group">
                            عرض جميع المتاجر <span className="group-hover:translate-x-2 transition-transform duration-300">←</span>
                        </Link>
                    </div>

                    {isLoadingStores ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white h-48 rounded-2xl animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {storesData?.data?.map((store: any, index: number) => (
                                <div
                                    key={store.id}
                                    className="animate-fade-in-up bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between group cursor-pointer"
                                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 p-1 shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                                <img src={store.logo ? `http://www.marketexpress.somee.com/${store.logo}` : '/placeholder-store.png'} alt={store.name} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                            <span className="text-moda-gold bg-moda-gold/10 text-xs font-semibold px-2 py-1 rounded-md">
                                                ★ 5.0
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-950 text-base mb-2 group-hover:text-moda-purple transition-colors duration-300">{store.storeName}</h3>
                                        <p className="text-xs text-moda-grayText line-clamp-3 leading-relaxed">
                                            {store.description || "لا يوجد وصف متوفر لهذا المتجر حالياً، ولكنه يقدم أحدث خطوط الموضة."}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-[11px] text-gray-400">متجر موثق ✓</span>
                                        <Link to={`/stores/${store.id}`} className="text-xs font-bold text-moda-purple flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                                            زيارة المتجر <span>←</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 4. قسم المنتجات الأرخص سعراً (مساحة لأقسامك المستقبلية) */}
            </main>
        </>
    );
}