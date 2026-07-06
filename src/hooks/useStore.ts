import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import api from '../services/api'; // تأكد من المسار
import toast from 'react-hot-toast';

interface ApiErrorResponse {
    message: string;
}

// =========================================================
// 1️⃣ أولاً: دوال الجلب (GET) باستخدام useQuery
// (يتم تصدير كل دالة بشكل منفصل لسهولة الاستخدام والتحديث التلقائي)
// =========================================================

// --- Store Queries ---
// تحديث الهوك ليقبل storeId اختياري (يمكن أن يكون string أو number أو undefined)
export const useGetAllStores = (storeId?: string | number) => {
    return useQuery({
        // 💡 أضفنا storeId إلى الـ queryKey لكي يتحدث الكاش تلقائياً عند تغيير رقم المتجر
        queryKey: ['allStores', storeId],
        queryFn: async () => {
            const { data } = await api.get('/Store/GetAllStores', {
                // 💡 هنا نمرر الـ StoreId للسيرفر كـ Query Parameter (?StoreId=1)
                // استخدمت الاسم الحرفي "StoreId" بالكابيتال بناءً على كلام المطور
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
            return data;
        }
    });
};

export const useGetAllProductsByStore = (storeId: string | number | null) => {
    return useQuery({
        queryKey: ['productsByStore', storeId],
        queryFn: async () => {
            // افترضنا أن المعرف يتم تمريره كـ Query Parameter (مثال: ?storeId=1)
            const { data } = await api.get('/Store/GetAllProductsByStore', { params: { storeId } });
            return data;
        },
        enabled: !!storeId, // الدالة لن تعمل إلا إذا كان هناك storeId
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
    // أضفنا كلمة return هنا لكي ترجع البيانات للمكون
    return useQuery({
        queryKey: ['clothingItem', productId],
        queryFn: async () => {
            const { data } = await api.get(`/ClothingItem/GetAll/${productId}`);
            return data;
        },
        // سيعمل فقط إذا كان الـ productId موجوداً وليس null أو undefined
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
        // سيعمل الاستدعاء فقط إذا كان productId واللون متوفرين
        enabled: !!productId && !!color,
    });
};

// 🎁 Hook لجلب المنتجات المقترحة (POST)
export const useGetSuggestProducts = (productId: number | null) => {
    return useQuery({
        queryKey: ['suggestedProducts', productId],
        queryFn: async () => {
            // بما أن الـ API يستقبل ProductId كـ Query Parameter والطلب نوعه POST
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
    // نستخدم queryClient لتحديث البيانات (Refetch) تلقائياً بعد أي عملية تعديل
    const queryClient = useQueryClient();

    // ---------------- Store Mutations ----------------

    const updateStoreMutation = useMutation<any, AxiosError<ApiErrorResponse>, any>({
        mutationFn: async (storeData) => {
            const { data } = await api.patch('/Store/UpdateStore', storeData);
            return data;
        },
        onSuccess: () => {
            toast.success("تم تحديث المتجر بنجاح");
            // تحديث قوائم المتاجر تلقائياً
            queryClient.invalidateQueries({ queryKey: ['allStores'] });
            queryClient.invalidateQueries({ queryKey: ['adminStores'] });
        }
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
            const { data } = await axios.post('http://www.marketexpress.somee.com/api/StoreRequest/Add', requestData, {
                headers:
                {
                    // أو أضف توكن المصادقة فقط إذا كان مطلوباً
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type':"multipart/form-data"
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
            console.log(err)
            console.log(err.message)
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
            // نمرر الـ ID في المسار والبيانات في جسم الطلب (Body)
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