import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAllStores, useGetAllProductsByStore } from '../../hooks/useStore';

export default function StoreDetails() {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    // جلب بيانات المتجر بناءً على الـ storeId (عبر الـ API المفلتر)
    const { data: storeResponse, isLoading: isLoadingStore } = useGetAllStores();

    // جلب المنتجات التابعة للمتجر
    const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsByStore(storeId ? parseInt(storeId) : null);
    const productsList = productsData?.data || (Array.isArray(productsData) ? productsData : []);
    // حالة المتابعة (Follow)
    const [isFollowing, setIsFollowing] = useState(false);
    // معالجة البيانات القادمة وتأمين جلب الكائن الصحيح
    // const currentStore = Array.isArray(storeResponse?.data) ? storeResponse?.data[0] : storeResponse?.data;
    const currentStore = storeResponse?.data.find((store: any) => store.id === parseInt(storeId!));

    if (isLoadingStore) {
        return (
            <div className="flex justify-center items-center py-24 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-moda-purple"></div>
                <span className="mr-3 font-medium">جاري تحميل بيانات المتجر...</span>
            </div>
        );
    }

    if (!currentStore) {
        return <div className="text-center py-24 text-red-500 font-bold">المتجر غير موجود أو تم حذفه.</div>;
    }

    // تنسيق بسيط لأوقات الدوام لحذف الثواني الزائدة (مثلاً تحويل 12:00:00 إلى 12:00)
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
    };

    return (
        <div className="container mx-auto px-6 py-8 space-y-12">

            {/* 1️⃣ بطاقة تفاصيل المتجر الرئيسية */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* خلفية الغلاف (Banner) */}
                <div className="h-48 md:h-64 bg-gradient-to-r from-purple-900 via-indigo-800 to-moda-purple relative"></div>

                {/* محتوى بيانات المتجر */}
                <div className="p-6 md:p-8 relative pt-0 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">

                    {/* الصورة والاسم والوصف الأساسي */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20 z-10 text-center md:text-right w-full md:w-auto">
                        <div className="w-32 h-32 bg-white rounded-2xl p-2 border border-gray-100 shadow-md overflow-hidden flex items-center justify-center">
                            <img
                                src={currentStore.logo ? `http://www.marketexpress.somee.com/${currentStore.logo}` : '/placeholder-store.png'}
                                alt={currentStore.storeName} // 💡 تم التحديث إلى storeName
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                                    {currentStore.storeName} {/* 💡 تم التحديث إلى storeName */}
                                </h1>
                                {currentStore.isActive && (
                                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-md font-medium">نشط ✓</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
                                {currentStore.description}
                            </p>
                        </div>
                    </div>

                    {/* زر المتابعة */}
                    <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-center">
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-md active:scale-95 ${isFollowing
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-moda-purple text-white hover:bg-moda-purpleHover'
                                }`}
                        >
                            {isFollowing ? 'إلغاء المتابعة' : 'متابعة المتجر +'}
                        </button>
                    </div>
                </div>

                {/* 2️⃣ قسم معلومات الاتصال والدوام الإضافية (تظهر بأسفل البطاقة) */}
                <div className="bg-gray-50/60 border-t border-gray-100 px-6 md:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">📍 العنوان:</span>
                        <span className="font-medium text-gray-800">{currentStore.address || "غير محدد"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">📞 الهاتف:</span>
                        <span className="font-medium text-gray-800" dir="ltr">{currentStore.storePhoneNumber || "غير محدد"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">✉️ البريد:</span>
                        <span className="font-medium text-gray-800 truncate">{currentStore.storeEmail || "غير محدد"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">⏰ الدوام:</span>
                        <span className="font-medium text-gray-800">
                            من {formatTime(currentStore.workingHoursStart)} حتى {formatTime(currentStore.workingHoursEnd)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3️⃣ قسم المنتجات الخاصة بالمتجر */}
            <section className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">منتجات المتجر</h2>
                    <p className="text-xs text-gray-400 mt-1">تصفح التشكيلة المميزة المتاحة لدى {currentStore.storeName}</p>
                </div>

                {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white h-72 rounded-2xl animate-pulse border border-gray-100"></div>
                        ))}
                    </div>
                ) : !productsData || productsData?.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        لا توجد منتجات معروضة في هذا المتجر حالياً.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productsList?.map((product: any) => {
                            const hasDiscount = product.discountPercentage !== null && product.discountPercentage > 0;

                            return (
                                <div
                                    key={product.id}
                                    // 💡 عند الضغط على الكرت يتم نقله لصفحة التفاصيل
                                    onClick={() => navigate(`products/${product.id}`)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                                >
                                    {/* قسم الصورة والشارات */}
                                    <div className="h-64 bg-gray-50 relative overflow-hidden">
                                        <img
                                            src={product.image ? product.image : '/placeholder-product.png'}
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

                                            {/* 💡 أزرار التحكم: إضافة زر "عرض" وزر السلة */}
                                            <div className="flex items-center gap-2">
                                                {/* زر عرض المنتج التفاعلي لمنع تداخل الأحداث استخدمنا e.stopPropagation() */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // يمنع تداخل الضغط مع الكرت الأب
                                                        navigate(`products/${product.id}`);
                                                    }}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-xl transition-all"
                                                >
                                                    عرض 👁️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // يمنع تداخل الضغط مع الكرت الأب
                                                        navigate(`products/${product.id}`);
                                                    }} // حماية زر السلة أيضاً
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
                )}
            </section>
        </div>
    );
}