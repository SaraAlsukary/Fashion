import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// إعداد الرابط الأساسي (يمكنك تغييره حسب مشروعك)

// ==========================================
// 1. Queries (لجلب البيانات)
// ==========================================

// جلب جميع الألوان (الـ ClothingItems) لمنتج معين
export const useGetClothingItems = (productId: number) => {
    return useQuery({
        queryKey: ['clothingItems', productId],
        queryFn: async () => {
            const { data } = await api.get(`ClothingItem/GetAll/${productId}`);
            return data;
        },
        enabled: !!productId, // لا تقم بالطلب إذا لم يكن هناك ID
    });
};

// جلب تفاصيل لون (ClothingItem) واحد
export const useGetClothingItem = (clothingItemId: number) => {
    return useQuery({
        queryKey: ['clothingItem', clothingItemId],
        queryFn: async () => {
            const { data } = await api.get(`ClothingItem/Get/${clothingItemId}`);
            return data;
        },
        enabled: !!clothingItemId,
    });
};

// جلب المقاسات الخاصة بمنتج ولون معين
export const useGetSizesByColor = (productId: number, color: string) => {
    return useQuery({
        queryKey: ['sizes', productId, color],
        queryFn: async () => {
            const { data } = await api.get(`ClothingItem/GetAllSizeByProductColor`, {
                params: { productId, color }
            });
            return data;
        },
        enabled: !!productId && !!color,
    });
};

// ==========================================
// 2. Mutations (للإضافة والتعديل)
// ==========================================

// إضافة لون جديد للمنتج (يدعم رفع صورة - FormData)
export const useAddColorForProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productId, formData }: { productId: number, formData: FormData }) => {
            const { data } = await api.post(`ClothingItem/AddColorforProduct`, formData, {
                params: { productId },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: (_, variables) => {
            // تحديث قائمة الألوان فوراً بعد الإضافة
            queryClient.invalidateQueries({ queryKey: ['clothingItems', variables.productId] });
        },
    });
};

// تعديل بيانات لون (مثل الصورة أو اسم اللون)
export const useUpdateColorDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ clothingItemId, color, formData }: { clothingItemId: number, color: string, formData: FormData }) => {
            const { data } = await api.put(`ClothingItem/UpdateDetailsforProduct`, formData, {
                params: { clothingItemId, Color: color },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clothingItems'] });
        },
    });
};

// إضافة مقاسات للون معين (JSON Body)
export const useAddSizesForProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productColorId, sizesData }: { productColorId: number, sizesData: any }) => {
            const { data } = await api.post(`ClothingItem/AddSizesforProduct`, sizesData, {
                params: { productColorId },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sizes'] });
        },
    });
};

// تعديل مقاس معين (مثلاً تحديث الكمية)
export const useUpdateSizeForProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productSizeId, sizeData }: { productSizeId: number, sizeData: any }) => {
            const { data } = await api.put(`ClothingItem/UpdateSizeforProduct`, sizeData, {
                params: { productSizeId },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sizes'] });
        },
    });
};