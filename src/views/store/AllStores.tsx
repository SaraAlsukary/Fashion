import { useNavigate } from 'react-router-dom';
import { useGetAllStores } from '../../hooks/useStore'; // تأكد من المسار

export default function AllStores() {
    const { data: storesData, isLoading, error } = useGetAllStores();
    const navigate = useNavigate();
    if (error) return <div className="text-center py-12 text-red-500">حدث خطأ أثناء تحميل المتاجر.</div>;

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-10 text-center md:text-right">
                <h1 className="text-3xl font-bold text-gray-900">جميع المتاجر في موضة</h1>
                <p className="text-sm text-gray-500 mt-2">اكتشف وتصفح المتاجر الموثقة لدينا واستمتع بتجربة تسوق فريدة</p>
            </div>

            {isLoading ? (
                // الهيكل المؤقت أثناء التحميل (Skeleton)
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="bg-white h-64 rounded-2xl animate-pulse border border-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {storesData?.data?.map((store: any) => (
                        <div
                            key={store.id}
                            onClick={() => navigate(`/stores/${store.id}`)} // الانتقال لصفحة التفاصيل
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 p-1 shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                        <img
                                            src={store.logo ? `${store.logo}` : '/placeholder-store.png'}
                                            alt={store.storeName}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <span className="text-moda-gold bg-moda-gold/10 text-xs font-semibold px-2 py-1 rounded-md">
                                        ★ 5.0
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-950 text-base mb-2 group-hover:text-moda-purple transition-colors duration-300">
                                    {store.storeName}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
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
        </div>
    );
}