import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCategory = () => {
    const queryClient = useQueryClient();

    // 1. جلب جميع الفئات باستخدام useQuery
    const { 
        data: categories = [], 
        isLoading, 
        error: queryError,
        refetch: fetchCategories 
    } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get(`/Category/GetAll`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error('حدث خطأ غير متوقع أثناء جلب البيانات');
        }
    });

    // 2. إضافة فئة جديدة باستخدام useMutation
    const addMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await api.post(`/Category/Add`, { name });
            return response;
        },
        onSuccess: () => {
            // تحديث قائمة الفئات تلقائياً بعد نجاح الإضافة
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    // 3. حذف فئة باستخدام useMutation
    const deleteMutation = useMutation({
        mutationFn: async (categoryId: number) => {
            const response = await api.delete(`/Category/Delete/${categoryId}`);
            return response;
        },
        onSuccess: () => {
            // تحديث قائمة الفئات تلقائياً بعد نجاح الحذف
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    // --- دوال مساعدة ليتوافق الـ Hook مع الكود القديم في الواجهة (لإرجاع true/false) ---
    
    const addCategory = async (name: string) => {
        try {
            await addMutation.mutateAsync(name);
            return true;
        } catch (error) {
            return false;
        }
    };

    const deleteCategory = async (categoryId: number) => {
        try {
            await deleteMutation.mutateAsync(categoryId);
            return true;
        } catch (error) {
            return false;
        }
    };

    // استخراج رسالة الخطأ من أي عملية فشلت
    const errorMessage = 
        (queryError as any)?.response?.data?.message || 
        (addMutation.error as any)?.response?.data?.message || 
        (deleteMutation.error as any)?.response?.data?.message || 
        null;

    return {
        categories,
        // يكون loading صحيحاً إذا كانت البيانات تُجلب أو يتم إضافة/حذف فئة
        loading: isLoading || addMutation.isPending || deleteMutation.isPending, 
        error: errorMessage,
        addCategory,
        deleteCategory,
        fetchCategories
    };
};