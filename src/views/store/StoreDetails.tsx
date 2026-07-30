import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// استيراد الـ Hooks الخاصة بك (تأكد من صحة المسارات)
import { useGetAllStores, useGetAllProductsByStore } from '../../hooks/useStore';
import { useComplaints } from '../../hooks/useComlaints';
import { useToggleStoreFollow, useGetStoreFollowersCount } from '../../hooks/useStoreFollowers'; // **(تم تحديث الاستيراد)**

export default function StoreDetails() {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    const currentStoreId = storeId ? parseInt(storeId) : 0;

    // جلب بيانات المتجر والمنتجات
    const { data: storeResponse, isLoading: isLoadingStore } = useGetAllStores();
    const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsByStore(currentStoreId || null);

    // هوك المتابعة وإلغاء المتابعة
    const { mutate: toggleFollow, isPending: isTogglingFollow } = useToggleStoreFollow();

    // **(تمت الإضافة)** هوك جلب عدد المتابعين
    const { data: followersData, isLoading: isLoadingFollowers } = useGetStoreFollowersCount(currentStoreId);

    // استخراج رقم المتابعين (تأكد من شكل الرد من الباك إند، أحياناً يكون العدد مباشرة أو بداخل داتا)
    const followersCount = followersData?.data ?? followersData ?? 0;

    // هوك الشكاوى
    const { useAddComplaint } = useComplaints();
    const { mutate: addComplaint, isPending: isSubmittingComplaint } = useAddComplaint();

    // حالات (States) النوافذ والمدخلات للشكوى
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [complaintTitle, setComplaintTitle] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [complaintSuccessMsg, setComplaintSuccessMsg] = useState('');

    // تحديد المتجر الحالي
    const currentStore = storeResponse?.data?.find((store: any) => store.id === currentStoreId)
        || (Array.isArray(storeResponse?.data) ? storeResponse?.data[0] : storeResponse?.data);

    // حالة المتابعة
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    useEffect(() => {
        if (currentStore && currentStore.isFollowed !== undefined) {
            setIsFollowing(currentStore.isFollowed);
        }
    }, [currentStore]);

    // تجهيز قائمة المنتجات
    const productsList = productsData?.data || (Array.isArray(productsData) ? productsData : []);

    // دالة لتنسيق الوقت
    const formatTime = (timeStr: any) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
    };

    // معالجة الضغط على زر المتابعة
    const handleToggleFollow = () => {
        if (!currentStoreId) return;

        toggleFollow(currentStoreId, {
            onSuccess: () => {
                setIsFollowing((prev) => !prev);
                toast.success(!isFollowing ? "تمت متابعة المتجر بنجاح" : "تم إلغاء متابعة المتجر");
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "حدث خطأ أثناء تغيير حالة المتابعة");
            }
        });
    };

    // معالجة إرسال الشكوى
    const handleComplaintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!complaintTitle || !complaintDescription) {
            toast.error("يرجى ملء جميع حقول الشكوى");
            return;
        }

        addComplaint(
            {
                storeId: currentStoreId,
                title: complaintTitle,
                description: complaintDescription,
            },
            {
                onSuccess: () => {
                    setComplaintSuccessMsg('تم إرسال الشكوى بنجاح إلى الإدارة.');
                    setComplaintTitle('');
                    setComplaintDescription('');
                    toast.success("تم إرسال الشكوى بنجاح");
                    setTimeout(() => {
                        setShowComplaintModal(false);
                        setComplaintSuccessMsg('');
                    }, 3000);
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء إرسال الشكوى، يرجى المحاولة لاحقاً.');
                }
            }
        );
    };

    // شاشة التحميل
    if (isLoadingStore) {
        return (
            <div className="flex justify-center items-center py-24 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-moda-purple"></div>
                <span className="mr-3 font-medium">جاري تحميل بيانات المتجر...</span>
            </div>
        );
    }

    // شاشة الخطأ (المتجر غير موجود)
    if (!currentStore) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-bold text-red-500 mb-4">المتجر غير موجود أو تم حذفه!</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                >
                    العودة للصفحة الرئيسية
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8 space-y-12">

            {/* زر الرجوع للخلف */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-moda-purple transition font-bold mb-4 w-fit"
            >
                <span>&rarr;</span> رجوع
            </button>

            {/* 1️⃣ بطاقة تفاصيل المتجر الرئيسية */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-48 md:h-64 bg-gradient-to-r from-purple-900 via-indigo-800 to-moda-purple relative"></div>

                <div className="p-6 md:p-8 relative pt-0 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20 z-10 text-center md:text-right w-full md:w-auto">
                        <div className="w-32 h-32 bg-white rounded-2xl p-2 border border-gray-100 shadow-md overflow-hidden flex items-center justify-center shrink-0">
                            <img
                                src={currentStore.logo ? `http://www.marketexpress.somee.com/${currentStore.logo}` : '/placeholder-store.png'}
                                alt={currentStore.storeName}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>
                        <div className="space-y-2 mb-2">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-2xl md:text-3xl font-black bg-white p-2 rounded-2xl text-purple-900">
                                    {currentStore.storeName}
                                </h1>

                            </div>
                            {currentStore.isActive && (
                                <p className="text-xs w-fit bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-md font-medium">نشط ✓</p>
                            )}
                            <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
                                {currentStore.description || "لا يوجد وصف متاح لهذا المتجر حتى الآن."}
                            </p>

                            {/* **(تمت الإضافة)** عرض عدد المتابعين */}
                            <div className="flex items-center gap-1.5 justify-center md:justify-start mt-2">
                                <span className="text-gray-400 font-bold text-sm">👥 المتابعين:</span>
                                {isLoadingFollowers ? (
                                    <div className="animate-pulse bg-gray-200 h-4 w-8 rounded-md"></div>
                                ) : (
                                    <span className="font-bold text-moda-purple">{followersCount}</span>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* أزرار الإجراءات (متابعة + شكوى) */}
                    <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto justify-center mb-2">
                        <button
                            onClick={() => setShowComplaintModal(true)}
                            className="px-6 py-3 rounded-full font-bold text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-sm"
                        >
                            إرسال شكوى ⚠️
                        </button>

                        <button
                            onClick={handleToggleFollow}
                            disabled={isTogglingFollow}
                            className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    : 'bg-moda-purple text-white hover:bg-purple-700'
                                }`}
                        >
                            {isTogglingFollow ? '⏳ جاري المعالجة...' : isFollowing ? 'إلغاء المتابعة' : 'متابعة المتجر +'}
                        </button>
                    </div>
                </div>

                {/* 2️⃣ قسم معلومات الاتصال والدوام */}
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

            {/* 3️⃣ قسم المنتجات الخاصة بالمتجر (بالتصميم الخاص بك) */}
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
                ) : !productsList || productsList.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        لا توجد منتجات معروضة في هذا المتجر حالياً.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productsList.map((product: any) => {
                            const hasDiscount = product.discountPercentage !== null && product.discountPercentage > 0;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => navigate(`products/${product.id}`)}
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
                )}
            </section>

            {/* 4️⃣ النافذة المنبثقة (Modal) لإرسال شكوى */}
            {showComplaintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setShowComplaintModal(false)}
                            className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">إرسال شكوى</h2>
                        <p className="text-sm text-gray-500 mb-6">سيتم مراجعة شكواك من قبل الإدارة بأسرع وقت ممكن.</p>

                        {complaintSuccessMsg ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center border border-green-200 font-medium">
                                ✓ {complaintSuccessMsg}
                            </div>
                        ) : (
                            <form onSubmit={handleComplaintSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الشكوى</label>
                                    <input
                                        type="text"
                                        value={complaintTitle}
                                        onChange={(e) => setComplaintTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-moda-purple focus:ring-2 focus:ring-moda-purple/20 outline-none transition bg-gray-50"
                                        placeholder="مثال: مشكلة في مصداقية المتجر"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">التفاصيل</label>
                                    <textarea
                                        value={complaintDescription}
                                        onChange={(e) => setComplaintDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-moda-purple focus:ring-2 focus:ring-moda-purple/20 outline-none transition bg-gray-50 h-32 resize-none"
                                        placeholder="يرجى كتابة تفاصيل الشكوى بوضوح..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingComplaint}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-moda-purple hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {isSubmittingComplaint ? 'جاري الإرسال...' : 'إرسال الشكوى'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}