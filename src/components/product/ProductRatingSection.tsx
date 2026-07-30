import { useState, useEffect } from 'react';
import { useProductRatingByUser, useAddRating } from '../../hooks/useRating';
import toast from 'react-hot-toast';

interface ProductRatingSectionProps {
    productId: number;
}

export default function ProductRatingSection({ productId }: ProductRatingSectionProps) {
    const [ratingValue, setRatingValue] = useState(5);
    const { data: userRatingData, isLoading: isLoadingRating, error: fetchError } = useProductRatingByUser(productId);
    const addRatingMutation = useAddRating();

    // استخراج قيمة التقييم كرقم سواء كان الرد كائناً يحتوي على ratingValue أو كان الرد رقماً مباشراً
    const currentUserRating = userRatingData?.ratingValue ?? (typeof userRatingData === 'number' ? userRatingData : null);

    useEffect(() => {
        if (userRatingData) {
            console.log("=== تشخيص التقييم الحالي ===");
            console.log("البيانات الخام القادمة من الـ API:", userRatingData);
            console.log("التقييم المستخرج كـ رقم:", currentUserRating);
        }
        if (fetchError) {
            console.error("خطأ أثناء جلب التقييم الحالي:", fetchError);
        }
    }, [userRatingData, fetchError, currentUserRating]);

    // تحديث النجوم محلياً عندما يأتي التقييم من السيرفر
    useEffect(() => {
        if (currentUserRating) {
            setRatingValue(currentUserRating);
        }
    }, [currentUserRating]);

    const handleAddRating = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!productId) {
            console.warn("❌ تم إلغاء الإرسال لأن productId غير موجود");
            return;
        }

        addRatingMutation.mutate({
            productId: productId,
            ratingValue: ratingValue,
        }, {
            onSuccess: (res: any) => {
                if (res && res.success === false) {
                    console.error("❌ الـ API أعاد حالة فشل داخلية:", res);
                    toast.error(res.message || "فشل حفظ التقييم من السيرفر");
                } else {
                    toast.success("✅ تم حفظ تقييمك بنجاح!");
                }
            },
            onError: (error: any) => {
                console.error("❌ خطأ صريح من تنفيذ الـ Mutation:", error);
                toast.error(error?.response?.data?.message || "حدث خطأ أثناء الاتصال بالسيرفر");
            }
        });
    };

    return (
        <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">ما رأيك في هذا المنتج؟</h3>
                <p className="text-xs text-gray-500">
                    {isLoadingRating
                        ? 'جاري التحقق من تقييمك...'
                        : currentUserRating
                            ? `لقد قمت بتقييم هذا المنتج بـ ${currentUserRating} نجوم`
                            : 'كن من أوائل المقيمين!'}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex gap-1" dir="ltr">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRatingValue(star)}
                            className={`text-2xl transition-transform hover:scale-110 focus:outline-none ${
                                star <= ratingValue
                                    ? 'text-yellow-400 drop-shadow-sm'
                                    : 'text-gray-300'
                            }`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <button
                    type='button'
                    onClick={handleAddRating}
                    disabled={addRatingMutation.isPending}
                    className="px-3 py-1.5 bg-yellow-400 text-yellow-900 font-bold text-xs rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {addRatingMutation.isPending ? '⏳ جارٍ...' : 'حفظ'}
                </button>
            </div>
        </div>
    );
}