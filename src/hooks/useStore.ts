import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import api from '../services/api'; // تأكد من المسار
import toast from 'react-hot-toast';

interface ApiErrorResponse {
    message: string;
}

// =========================================================
// 1️⃣ أولاً: دوال الجلب (GET) باستخدام useQuery
// =========================================================

// --- Store Queries ---
export const useGetAllStores = (storeId?: string | number) => {
    return useQuery({
        queryKey: ['allStores', storeId],
        queryFn: async () => {
            const { data } = await api.get('/Store/GetAllStores', {
                params: storeId ? { storeId: storeId } : {}
            });
            return data;
        },
    });
};

export const useGetStoresByAdmin = () => {
    return useQuery({
        queryKey: ['adminStores'],
        queryFn: async () => {
            const { data } = await api.get('/Store/GetStoresByAdmin');
            return data?.data;
        }
    });
};

export const useGetAllProductsByStore = (storeId: string | number | null) => {
    return useQuery({
        queryKey: ['productsByStore', storeId],
        queryFn: async () => {
            const { data } = await api.get('/Store/GetAllProductsByStore', { params: { storeId } });
            return data;
        },
        enabled: !!storeId,
    });
};

// --- StoreCategory Queries ---
export const useGetAllStoreCategoryByAdmin = () => {
    return useQuery({
        queryKey: ['adminStoreCategories'],
        queryFn: async () => {
            const { data } = await api.get('/StoreCategory/GetAllStoreCategoryByAdmin');
            return data;
        }
    });
};

// --- StoreRequest Queries ---
export const useGetFilesByStore = (storeId: string | number | null) => {
    return useQuery({
        queryKey: ['filesByStore', storeId],
        queryFn: async () => {
            const { data } = await api.get(`/StoreRequest/GetFilesByStore/${storeId}`);
            return data;
        },
        enabled: !!storeId,
    });
};

export const useGetAllRequestStoreByUser = () => {
    return useQuery({
        queryKey: ['userStoreRequests'],
        queryFn: async () => {
            const { data } = await api.get('/StoreRequest/GetAllRequestStoreByUser');
            return data;
        }
    });
};

export const useProductDetailsStore = (productId: string | number | null) => {
    return useQuery({
        queryKey: ['clothingItem', productId],
        queryFn: async () => {
            const { data } = await api.get(`/ClothingItem/GetAll/${productId}`);
            return data;
        },
        enabled: !!productId
    });
};

export const useGetSizesByProductColor = (productId: number | null, color: string | null) => {
    return useQuery({
        queryKey: ['productSizes', productId, color],
        queryFn: async () => {
            const { data } = await api.get('/ClothingItem/GetAllSizeByProductColor', {
                params: { productId, color }
            });
            return data;
        },
        enabled: !!productId && !!color,
    });
};

export const useGetSuggestProducts = (productId: number | null) => {
    return useQuery({
        queryKey: ['suggestedProducts', productId],
        queryFn: async () => {
            const { data } = await api.post(`/ClothingItem/GetSuggestByProductId`, null, {
                params: { ProductId: productId }
            });
            return data;
        },
        enabled: !!productId,
    });
};

export const useGetFilterRequestStoreByUser = (filters: any) => {
    return useQuery({
        queryKey: ['filteredStoreRequests', filters],
        queryFn: async () => {
            const { data } = await api.get('/StoreRequest/GetFilterRequestStoreByUser', { params: filters });
            return data;
        }
    });
};


// =========================================================
// 2️⃣ ثانياً: دوال التعديل (Mutations) في Hook واحد مجمع (useStore)
// =========================================================

export const useStore = () => {
    const queryClient = useQueryClient();

    // ---------------- Store Mutations ----------------

    const updateStoreMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (storeData) => {
            const { data } = await api.patch('/Store/UpdateStore', storeData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            return data;
        },
        onSuccess: () => {
            toast.success("تم تحديث المتجر بنجاح");
            queryClient.invalidateQueries({ queryKey: ['allStores'] });
            queryClient.invalidateQueries({ queryKey: ['adminStores'] });
        },
        onError: (err) => {
            toast.error("حدث خطأ أثناء التحديث");
            console.error(err);
        }
    });

    // دالة طلب API لحذف المتجر
    const deleteStoreApi = async (storeId: string | number) => {
        const { data } = await api.delete(`/Store/Delete/${storeId}`);
        return data;
    };

    const deleteStoreMutation = useMutation<any, AxiosError<ApiErrorResponse>, string | number>({
        mutationFn: (storeId) => deleteStoreApi(storeId),
        onSuccess: () => {
            toast.success("تم حذف المتجر بنجاح");
            queryClient.invalidateQueries({ queryKey: ['allStores'] });
            queryClient.invalidateQueries({ queryKey: ['adminStores'] });
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء حذف المتجر");
            console.error('حدث خطأ أثناء حذف المتجر:', error);
        },
    });

    // ---------------- StoreCategory Mutations ----------------

    const addStoreCategoryMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (categoryData) => {
            const { data } = await api.post('/StoreCategory/Add', categoryData);
            return data;
        },
        onSuccess: () => {
            toast.success("تم إضافة القسم بنجاح");
            queryClient.invalidateQueries({ queryKey: ['adminStoreCategories'] });
        }
    });

    const deleteStoreCategoryMutation = useMutation<any, AxiosError<ApiErrorResponse>, string | number>({
        mutationFn: async (storeCategoryId) => {
            const { data } = await api.delete(`/StoreCategory/Delete/${storeCategoryId}`);
            return data;
        },
        onSuccess: () => {
            toast.success("تم حذف القسم بنجاح");
            queryClient.invalidateQueries({ queryKey: ['adminStoreCategories'] });
        }
    });

    // ---------------- StoreRequest Mutations ----------------

    const addStoreRequestMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (requestData) => {
            const { data } = await axios.post('http://marketexpress.somee.com/api/StoreRequest/Add', requestData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            return data;
        },
        onSuccess: () => {
            toast.success("تم إرسال الطلب بنجاح");
            queryClient.invalidateQueries({ queryKey: ['userStoreRequests'] });
        },
        onError: (err) => {
            toast.error("حدث خطأ");
            console.error(err);
        }
    });

    const cancelStoreRequestMutation = useMutation<any, AxiosError<ApiErrorResponse>, string | number>({
        mutationFn: async (storeRequestId) => {
            const { data } = await api.put(`/StoreRequest/CancelRequest/${storeRequestId}/cancel`);
            return data;
        },
        onSuccess: () => {
            toast.success("تم إلغاء الطلب");
            queryClient.invalidateQueries({ queryKey: ['userStoreRequests'] });
        }
    });

    const updateStoreRequestMutation = useMutation<any, AxiosError<ApiErrorResponse>, { storeId: string | number, requestData: any }>({
        mutationFn: async ({ storeId, requestData }) => {
            const { data } = await api.put(`/StoreRequest/UpdateRequest/${storeId}/update`, requestData);
            return data;
        },
        onSuccess: () => {
            toast.success("تم تحديث الطلب بنجاح");
            queryClient.invalidateQueries({ queryKey: ['userStoreRequests'] });
        }
    });

    return {
        // Store
        updateStore: updateStoreMutation.mutate,
        isUpdatingStore: updateStoreMutation.isPending,
        deleteStore: deleteStoreMutation.mutate,
        isDeletingStore: deleteStoreMutation.isPending,

        // StoreCategory
        addCategory: addStoreCategoryMutation.mutate,
        isAddingCategory: addStoreCategoryMutation.isPending,
        deleteCategory: deleteStoreCategoryMutation.mutate,
        isDeletingCategory: deleteStoreCategoryMutation.isPending,

        // StoreRequest
        addStoreRequest: addStoreRequestMutation.mutate,
        isAddingRequest: addStoreRequestMutation.isPending,
        cancelStoreRequest: cancelStoreRequestMutation.mutate,
        isCancelingRequest: cancelStoreRequestMutation.isPending,
        updateStoreRequest: updateStoreRequestMutation.mutate,
        isUpdatingRequest: updateStoreRequestMutation.isPending,
    };
};