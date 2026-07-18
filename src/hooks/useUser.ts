import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// --- جلب بيانات المستخدم ---
export const getUserProfile = async (): Promise<any> => {
    const response = await api.get('/User/GetUserProfile');
    // السيرفر يرجع البيانات داخل كائن، لذلك نصل إلى .data.data
    return response.data.data; 
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserProfile,
    });
};

// --- تحديث صورة المستخدم ---
export const updateProfilePhoto = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put('/User/UpdateProfilePhoto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const useUpdateProfilePhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfilePhoto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        }
    });
};