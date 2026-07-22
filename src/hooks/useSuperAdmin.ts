import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ==========================================
// 1️⃣ واجهات البيانات (Interfaces)
// ==========================================

export interface AddRolePayload {
    roleName: string;
    permissions?: string[];
}

export interface RejectRequestPayload {
    requestId: number;
    reason?: string;
}

export interface StoreFilterParams {
    storeStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Deleted' | 'Cancelled';
    pageNumber?: number;
    pageSize?: number;
}

// ==========================================
// 2️⃣ دوال الاتصال بالـ API
// ==========================================

export const revokeToken = async (userId: string): Promise<any> => {
    const response = await api.post(`/SuperAdmin/RevokeToken/${userId}`);
    return response.data;
};

export const fetchStoreCategories = async (storeId: number): Promise<any> => {
    const response = await api.get(`/SuperAdmin/GetAllStoreCategory/${storeId}`);
    return response.data?.data ?? response.data;
};

export const addRole = async (payload: AddRolePayload): Promise<any> => {
    const response = await api.post('/SuperAdmin/AddRole', payload);
    return response.data;
};

export const approveRequest = async (requestId: number): Promise<any> => {
    const response = await api.patch(`/SuperAdmin/RequestApproved/${requestId}`);
    return response.data;
};

export const rejectRequest = async (payload: RejectRequestPayload): Promise<any> => {
    const response = await api.patch('/SuperAdmin/RequestRejected', payload);
    return response.data;
};

export const fetchRequestStoresByFilter = async (params: StoreFilterParams): Promise<any> => {
    const response = await api.get('/SuperAdmin/GetAllRequestStoreByFilter', { params });
    return response.data?.data ?? response.data;
};

// ==========================================
// 3️⃣ Hooks
// ==========================================

// هوك سحب صلاحية مستخدم
export const useRevokeToken = () => {
    return useMutation({
        mutationFn: revokeToken,
        onSuccess: () => console.log("✅ تم سحب التوكن بنجاح"),
    });
};

// هوك جلب تصنيفات متجر معين
export const useStoreCategories = (storeId: number) => {
    return useQuery({
        queryKey: ['storeCategories', storeId],
        queryFn: () => fetchStoreCategories(storeId),
        enabled: !!storeId, // لا يتم الاستدعاء إلا إذا كان المتجر موجوداً
    });
};

// هوك إضافة دور جديد
export const useAddRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addRole,
        onSuccess: () => {
            console.log("✅ تم إضافة الدور بنجاح");
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};

// هوك الموافقة على طلب متجر
export const useApproveRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveRequest,
        onSuccess: () => {
            console.log("✅ تمت الموافقة على الطلب");
            queryClient.invalidateQueries({ queryKey: ['storeRequests'] });
        },
    });
};

// هوك رفض طلب متجر
export const useRejectRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectRequest,
        onSuccess: () => {
            console.log("✅ تم رفض الطلب");
            queryClient.invalidateQueries({ queryKey: ['storeRequests'] });
        },
    });
};

// هوك جلب طلبات المتاجر مع الفلترة
export const useRequestStores = (params: StoreFilterParams) => {
    return useQuery({
        queryKey: ['storeRequests', params],
        queryFn: () => fetchRequestStoresByFilter(params),
    });
};