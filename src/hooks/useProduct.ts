import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// جلب المنتجات حسب رقم المتجر
export const useGetProducts = (storeId?: number) => { // جعلناه اختيارياً بوضع علامة استفهام
    return useQuery({
        queryKey: ['products', storeId], // إضافة الـ id لتمييز الكاش
        queryFn: async () => {
            // التصحيح هنا: تمرير الباراميتر ككائن
            const { data } = await api.get(`/Store/GetAllProductsByStore`, { params: { storeId } });
            return data;
        },
        enabled: !!storeId, // !! تعني: لا تقم بتنفيذ هذا الاستعلام إلا إذا كان storeId موجوداً (ليس null أو undefined)
    });
};

// إضافة منتج جديد
export const useAddProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post(`/Product/AddProduct`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            // سيقوم بتحديث أي استعلام يبدأ بـ 'products'
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
        },
    });
};

// تعديل منتج
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productId, formData }: { productId: number, formData: FormData }) => {
            const { data } = await api.put(`/Product/UpdateProduct/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

// حذف منتج
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productId: number) => {
            const { data } = await api.delete(`/Product/DeleteProduct/${productId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};