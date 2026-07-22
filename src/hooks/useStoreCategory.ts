import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// رابط الـ API بناءً على ما أرسلته

// جلب جميع الفئات
export const useGetStoreCategories = () => {
    return useQuery({
        queryKey: ['storeCategories'],
        queryFn: async () => {
            const { data } = await api.get(`StoreCategory/GetAllStoreCategoryByAdmin`);
            // بناءً على هيكل الاستجابة الذي أرسلته، البيانات الفعلية موجودة داخل data.data
            return data.data;
        },
    });
};

// إضافة فئة جديدة
export const useAddStoreCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // افترضت أن الـ Body يحتاج كائن يحتوي على Name (يمكنك تعديلها إذا كان الـ API يطلب خصائص أخرى)
        mutationFn: async (categoryData: { categoryId: number }) => {
            const { data } = await api.post(`StoreCategory/Add`, categoryData);
            return data;
        },
        onSuccess: () => {
            // تحديث القائمة فوراً بعد الإضافة
            queryClient.invalidateQueries({ queryKey: ['storeCategories'] });
        },
    });
};

// حذف فئة
export const useDeleteStoreCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (storeCategoryId: number) => {
            const { data } = await api.delete(`StoreCategory/Delete/${storeCategoryId}`);
            return data;
        },
        onSuccess: () => {
            // تحديث القائمة فوراً بعد الحذف
            queryClient.invalidateQueries({ queryKey: ['storeCategories'] });
        },
    });
};