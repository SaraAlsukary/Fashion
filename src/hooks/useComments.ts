import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api'; // استيراد نسخة axios التي تم إعدادها بالـ interceptors
import { toast } from 'react-hot-toast';

// --- 1️⃣ TypeScript Interfaces ---

export interface CommentItem {
    commentId: number;
    productId: number;
    userId: string;
    userFullName: string;
    userImage: string | null;
    text: string;
    createdAt: string;
    updatedAt: string | null;
}

interface ApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    errors: any[];
}

export interface GetCommentsParams {
    productId: number;
    pageNumber: number;
    pageSize: number;
}

export interface AddCommentPayload {
    content: string;
    productId: number;
}

export interface UpdateCommentPayload {
    commentId: number;
    content: string;
}

// --- 2️⃣ React Query Hooks ---

/**
 * جلب جميع التعليقات الخاصة بمنتج معين مع الترقيم التلقائي صفحات (Pagination)
 */
export const useGetComments = (params: GetCommentsParams) => {
    return useQuery<ApiResponse<CommentItem[]>, Error>({
        queryKey: ['comments', params.productId, params.pageNumber, params.pageSize],
        queryFn: async () => {
            const { data } = await api.get<ApiResponse<CommentItem[]>>('/Comment/GetAll', {
                params: {
                    productId: params.productId,
                    pageNumber: params.pageNumber,
                    pageSize: params.pageSize,
                },
            });
            return data;
        },
        enabled: !!params.productId, // لا يتم تشغيل الطلب إلا في حال وجود id للمنتج
    });
};

/**
 * إضافة تعليق جديد لمنتج
 */
export const useAddComment = (productId: number) => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<CommentItem>, Error, AddCommentPayload>({
        mutationFn: async (payload) => {
            const { data } = await api.post<ApiResponse<CommentItem>>('/Comment/Add', payload);
            return data;
        },
        onSuccess: () => {
            toast.success('تم إضافة التعليق بنجاح');
            // تحديث كاش التعليقات الخاص بهذا المنتج فوراً ليظهر التعليق الجديد
            queryClient.invalidateQueries({ queryKey: ['comments', productId] });
        },
        onError: () => {
            toast.error('فشل إضافة التعليق، يرجى المحاولة لاحقاً');
        },
    });
};

/**
 * حذف تعليق محدد
 */
export const useDeleteComment = (productId: number) => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<null>, Error, number>({
        mutationFn: async (commentId) => {
            const { data } = await api.delete<ApiResponse<null>>('/Comment/Delete', {
                params: { commentId },
            });
            return data;
        },
        onSuccess: () => {
            toast.success('تم حذف التعليق');
            queryClient.invalidateQueries({ queryKey: ['comments', productId] });
        },
        onError: () => {
            toast.error('فشل حذف التعليق');
        },
    });
};

/**
 * تعديل تعليق موجود مسبقاً
 */
export const useUpdateComment = (productId: number) => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<CommentItem>, Error, UpdateCommentPayload>({
        mutationFn: async (payload) => {
            const { data } = await api.put<ApiResponse<CommentItem>>('/Comment/Update', payload);
            return data;
        },
        onSuccess: () => {
            toast.success('تم تحديث التعليق بنجاح');
            queryClient.invalidateQueries({ queryKey: ['comments', productId] });
        },
        onError: () => {
            toast.error('فشل تعديل التعليق');
        },
    });
};