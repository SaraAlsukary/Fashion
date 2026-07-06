import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// -- Types --
// قم بتعديل هذه الحقول بناءً على متطلبات الـ API الفعلي لديك
export interface AddRatingPayload {
    productId: number;
    ratingValue: number;
    review?: string;
}

export interface RatingResponse {
    id: number;
    productId: number;
    ratingValue: number;
    // ... أي بيانات أخرى تعود من الخادم
}

// -- API Functions --

// دالة لجلب تقييم المستخدم لمنتج معين (GET)
export const fetchProductRatingByUser = async (productId: number): Promise<RatingResponse> => {
    const { data } = await api.get('/Rating/GetProductRatingByUser', {
        params: { productId },
    });
    return data;
};

// دالة لإضافة أو تحديث تقييم (POST)
export const postAddRating = async (payload: AddRatingPayload): Promise<any> => {
    const { data } = await api.post('/Rating/AddRating', payload);
    return data;
};
/**
 * Hook لجلب تقييم المستخدم الحالي لمنتج معين
 */
export const useProductRatingByUser = (productId: number) => {
    return useQuery({
        // مفتاح فريد للاستعلام، يتضمن الـ productId لتخزين بيانات كل منتج على حدة
        queryKey: ['productRating', productId],
        queryFn: () => fetchProductRatingByUser(productId),
        // لا تقم بتشغيل الاستعلام إذا لم يكن هناك productId صالح
        enabled: !!productId,
    });
};

/**
 * Hook لإرسال تقييم جديد
 */
export const useAddRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddRatingPayload) => postAddRating(payload),

        // عند نجاح الإضافة، نقوم بإلغاء التخزين المؤقت للتقييم السابق 
        // ليقوم React Query بجلبه مرة أخرى وعرض التحديث الجديد تلقائياً
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['productRating', variables.productId],
            });
        },
        onError: (error) => {
            console.error('حدث خطأ أثناء إضافة التقييم:', error);
            // يمكنك إضافة إشعارات (Toasts) هنا
        },
    });
};