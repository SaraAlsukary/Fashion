import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface AddRatingPayload {
    productId: number;
    ratingValue: number;
    review?: string;
}

// جلب تقييم المستخدم الحالي لمنتج معين
export const fetchProductRatingByUser = async (productId: number): Promise<any> => {
    const response = await api.get('/Rating/GetProductRatingByUser', {
        params: { productId },
    });
    // هنا نقوم بفك التغليف الآمن: إذا كان هناك كائن data داخلي نأخذه، وإلا نأخذ الاستجابة كاملة
    return response.data?.data ?? response.data;
};

// إرسال أو تحديث التقييم
export const addRating = async (payload: AddRatingPayload): Promise<any> => {
    const response = await api.post('/Rating/AddRating', payload);
    return response.data;
};

export const useProductRatingByUser = (productId: number) => {
    return useQuery({
        queryKey: ['productRating', productId],
        queryFn: () => fetchProductRatingByUser(productId),
        enabled: !!productId,
    });
};

export const useAddRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addRating,
        onSuccess: (data, variables) => {
            console.log("Mutation Success Response:", data);
            queryClient.invalidateQueries({ queryKey: ['productRating', variables.productId] });
            queryClient.invalidateQueries({ queryKey: ['productDetails', variables.productId] });
        },
        onError: (error) => {
            console.error("Mutation Error Object:", error);
        }
    });
};