import { useEffect, useState } from 'react';
import api, { API_BASE_URL, API_IMAGE } from '../services/api';


export default function Home() {
    const [stores, setStores] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    // جلب المتاجر من الـ API
    useEffect(() => {
        api.get('/Store/GetAllStores')
            .then(response => {
                setStores(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("حدث خطأ أثناء جلب المتاجر", err);
                setLoading(false);
            });
    }, []);

    console.log(stores)
    return (
        <>


            {/* 1. الهيدر (أنميشن انزلاق للأسفل) */}
            <section className="animated-hero-bg text-white py-24 px-6 relative shadow-inner">
                <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center gap-6">
                    <span className="animate-fade-in-up delay-100 bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs px-4 py-1.5 rounded-full font-semibold uppercase tracking-wider hover:bg-white/20 transition-colors cursor-default">
                        مرحباً بك في عالم الأناقة الفاخرة ✨
                    </span>
                    <h2 className="animate-fade-in-up delay-200 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wide max-w-4xl mx-auto drop-shadow-lg">
                        اكتشف الموضة من منظور المبدعين والمتاجر العالمية
                    </h2>
                    <p className="animate-fade-in-up delay-300 text-gray-200 text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light drop-shadow-md">
                        منصتك المتكاملة لبيع وشراء أحدث صيحات الموضة. تصفح، تسوق، وعش التجربة الفريدة.
                    </p>
                    <div className="animate-fade-in-up delay-400 pt-6 flex justify-center gap-4">
                        <button className="bg-white text-moda-purple hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            تصفح المتاجر الآن
                        </button>
                        <button className="bg-transparent border border-white/40 hover:border-white hover:bg-white/10 text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300">
                            تعرف علينا
                        </button>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-6 py-16 space-y-20">

                {/* 3. قسم المتاجر الموصى بها */}
                <section>
                    <div className="animate-fade-in-up flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">متاجر موصى بها</h2>
                            <p className="text-sm text-moda-grayText mt-1">متاجر متميزة تم اختيارها لك بعناية</p>
                        </div>
                        <button className="text-moda-purple hover:text-moda-purpleHover text-sm font-bold flex items-center gap-2 transition-all group">
                            عرض جميع المتاجر <span className="group-hover:translate-x-2 transition-transform duration-300">←</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white h-48 rounded-2xl animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {stores.data.map((store: any, index: number) => (
                                /* تطبيق تأخير زمني ديناميكي بناءً على ترتيب المتجر */
                                <div
                                    key={store.id}
                                    className="animate-fade-in-up bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between group cursor-pointer"
                                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 p-1 shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                                <img src={`${API_IMAGE}/${store.logo}` || '/placeholder-store.png'} alt={store.name} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                            <span className="text-moda-gold bg-moda-gold/10 text-xs font-semibold px-2 py-1 rounded-md">
                                                ★ 5.0
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-950 text-base mb-2 group-hover:text-moda-purple transition-colors duration-300">{store.name}</h3>
                                        <p className="text-xs text-moda-grayText line-clamp-3 leading-relaxed">
                                            {store.description || "لا يوجد وصف متوفر لهذا المتجر حالياً، ولكنه يقدم أحدث خطوط الموضة."}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-[11px] text-gray-400">متجر موثق ✓</span>
                                        <button className="text-xs font-bold text-moda-purple flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                                            زيارة المتجر <span>←</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 4. قسم المنتجات الأرخص سعراً */}
                <section>
                    <div className="animate-fade-in-up delay-200 flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">الأرخص سعراً والأكثر طلباً</h2>
                            <p className="text-sm text-moda-grayText mt-1">أحدث صيحات الموضة بأسعار تنافسية تناسب الجميع</p>
                        </div>
                        <button className="text-moda-purple hover:text-moda-purpleHover text-sm font-bold flex items-center gap-2 transition group">
                            تصفح المنتجات <span className="group-hover:translate-x-2 transition-transform duration-300">←</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* كرت ويب منتج 1 */}
                        <div className="animate-fade-in-up delay-300 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative">
                            <div className="h-72 bg-moda-cardDark relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-moda-purple font-bold text-xs px-3 py-1 rounded-full z-20 shadow-sm animate-pulse">
                                    توفير كبير 🔖
                                </span>
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform duration-700">
                                    [صورة المنتج]
                                </div>
                            </div>
                            <div className="p-5 space-y-1.5 relative z-20 bg-white">
                                <span className="text-[11px] font-semibold text-moda-purple tracking-wider uppercase">Nordic Style</span>
                                <h4 className="font-bold text-gray-900 text-sm truncate">Slim Fit Black Jeans</h4>
                                <div className="flex justify-between items-center pt-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 line-through">150 ل.س</span>
                                        <span className="text-base font-black text-gray-900">89 ل.س</span>
                                    </div>
                                    <button className="bg-moda-purple hover:bg-moda-purpleHover text-white text-xs font-medium py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
                                        إضافة للسلة
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* كرت ويب منتج 2 */}
                        <div className="animate-fade-in-up delay-400 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative">
                            <div className="h-72 bg-moda-cardDark relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full z-20 shadow-sm">
                                    خصم 30%
                                </span>
                                <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform duration-700">
                                    [صورة المنتج]
                                </div>
                            </div>
                            <div className="p-5 space-y-1.5 relative z-20 bg-white">
                                <span className="text-[11px] font-semibold text-moda-purple tracking-wider uppercase">Velvet Vogue</span>
                                <h4 className="font-bold text-gray-900 text-sm truncate">Classic Denim Jacket</h4>
                                <div className="flex justify-between items-center pt-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 line-through">220 ل.س</span>
                                        <span className="text-base font-black text-gray-900">145 ل.س</span>
                                    </div>
                                    <button className="bg-moda-purple hover:bg-moda-purpleHover text-white text-xs font-medium py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
                                        إضافة للسلة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* 5. الفوتر */}

        </>
    );
}