import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const updateProfilePhoto = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file); // 'image' هو المفتاح المتوقع في السيرفر

    const response = await api.put('/User/UpdateProfilePhoto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // مهم جداً لرفع الملفات
        },
    });
    return response.data;
};

export const useUpdateProfilePhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfilePhoto,
        onSuccess: (data) => {
            console.log("✅ تم تحديث الصورة الشخصية بنجاح", data);
            // قم بعمل invalidate لهوك بيانات المستخدم الأساسية هنا إذا كان لديك
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        }
    });
};