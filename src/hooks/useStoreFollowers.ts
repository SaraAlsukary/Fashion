import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface FollowStorePayload {
    storeId: number;
}

// 1. API: إرسال طلب المتابعة / إلغاء المتابعة (PUT)
export const toggleStoreFollowApi = async (storeId: number): Promise<any> => {
    const response = await api.put('/StoreFollower/StoreFollow', { storeId }, {
        params: { storeId }
    });
    return response.data;
};

// 2. API: جلب منتجات المتاجر المتابَعة (GET)
export const getProductsByFollowedStoresApi = async (): Promise<any> => {
    const response = await api.get('/StoreFollower/GetProductsByFollowerStores');
    return response.data;
};

// 3. API: جلب عدد المتابعين للمتجر (GET) - **(تمت إضافته)**
export const getStoreFollowersCountApi = async (storeId: number): Promise<any> => {
    const response = await api.get('/StoreFollower/GetStoreFollowersCount', {
        params: { storeId }
    });
    return response.data;
};

// ---------------- Hook المتابعة / إلغاء المتابعة ----------------
export const useToggleStoreFollow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (storeId: number) => toggleStoreFollowApi(storeId),
        onSuccess: (_, storeId) => {
            queryClient.invalidateQueries({ queryKey: ['followedStoresProducts'] });
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            queryClient.invalidateQueries({ queryKey: ['storeDetails', storeId] });
            // **تحديث عدد المتابعين فوراً عند ضغط زر المتابعة**
            queryClient.invalidateQueries({ queryKey: ['storeFollowersCount', storeId] }); 
        },
        onError: (error: any) => {
            console.error("خطأ أثناء تغيير حالة المتابعة:", error);
        },
    });
};

// ---------------- Hook جلب منتجات المتاجر المتابَعة ----------------
export const useGetProductsByFollowedStores = () => {
    return useQuery({
        queryKey: ['followedStoresProducts'],
        queryFn: getProductsByFollowedStoresApi,
    });
};

// ---------------- Hook جلب عدد المتابعين ---------------- **(تمت إضافته)**
export const useGetStoreFollowersCount = (storeId: number) => {
    return useQuery({
        queryKey: ['storeFollowersCount', storeId],
        queryFn: () => getStoreFollowersCountApi(storeId),
        enabled: !!storeId, // لا تقم بتنفيذ الطلب إذا لم يكن هناك ID
    });
};