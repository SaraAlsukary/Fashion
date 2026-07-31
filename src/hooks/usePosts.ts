import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api'; // تأكد من مسار الـ api الخاص بك

// =========================================================
// 1️⃣ Types & Interfaces (الأنواع لتسهيل التعامل مع TypeScript)
// =========================================================

export type PostVisibility = 'Public' | 'Followers';
export type ReactionType = 'Like' | 'Love' | 'Haha' | 'Wow' | 'Sad' | 'Angry';

export interface PostReactionData {
    postId: number;
    reactionType: ReactionType;
}

// =========================================================
// 2️⃣ GET Queries (جلب البيانات)
// =========================================================

/**
 * جلب جميع المنشورات الخاصة بمتجر معين
 */
export const useGetAllPosts = (storeId: number | string | null) => {
    return useQuery({
        queryKey: ['posts', storeId],
        queryFn: async () => {
            const { data } = await api.get(`/Post/GetAll/${storeId}`);
            return data;
        },
        // لن يتم تنفيذ الطلب إلا إذا كان storeId موجوداً
        enabled: !!storeId, 
    });
};

// =========================================================
// 3️⃣ Mutations (الإضافة، التعديل، الحذف، التفاعل)
// =========================================================

/**
 * إضافة منشور جديد (يستقبل FormData لأن الطلب multipart/form-data)
 */
// ✅ تعديل useAddPost
// ✅ تعديل useAddPost
export const useAddPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            // 🚨 التعديل الجذري هنا: إجبار axios على استخدام صيغة الملفات
            const { data } = await api.post('/Post/Add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data;
        },
        onSuccess: () => {
            toast.success('تم نشر المنشور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: any) => {
            console.error('Add Post Error:', error?.response?.data || error);
            toast.error(error?.response?.data?.message || 'حدث خطأ أثناء نشر المنشور');
        }
    });
};

// ✅ تعديل useUpdatePost
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, formData }: { postId: number; formData: FormData }) => {
            // 🚨 إضافة نفس الهيدر هنا أيضاً
            const { data } = await api.put(`/Post/Update/${postId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data;
        },
        onSuccess: () => {
            toast.success('تم تعديل المنشور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: any) => {
            console.error('Update Post Error:', error?.response?.data || error);
            toast.error(error?.response?.data?.message || 'حدث خطأ أثناء تعديل المنشور');
        }
    });
};
/**
 * حذف منشور
 */
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: number) => {
            const { data } = await api.delete(`/Post/Delete/${postId}`);
            return data;
        },
        onSuccess: () => {
            toast.success('تم حذف المنشور');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error) => {
            console.error('Delete Post Error:', error);
            toast.error('حدث خطأ أثناء حذف المنشور');
        }
    });
};

/**
 * التفاعل مع المنشور (Like, Love, Haha, etc...)
 */
export const usePostReaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reactionData: PostReactionData) => {
            const { data } = await api.post('/PostReaction', reactionData);
            return data;
        },
        onSuccess: () => {
            // يمكنك هنا عمل Invalidate لتحديث العداد الخاص بالتفاعلات
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error) => {
            console.error('Reaction Error:', error);
            toast.error('حدث خطأ أثناء تسجيل التفاعل');
        }
    });
};