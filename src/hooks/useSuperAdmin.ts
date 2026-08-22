import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

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

// 👈 إضافة واجهة فلترة الطلبيات (الجديدة)
export interface OrderFilterParams {
    orderStatus?: 'Processing' | 'Cancelled' | 'Delivered';
    pageNumber?: number;
    pageSize?: number;
}

// ==========================================
// 2️⃣ دوال الاتصال بالـ API
// ==========================================

// --- المتاجر والأدوار ---
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

// --- المستخدمين (جديد) ---
export const revokeToken = async (userId: string): Promise<any> => {
    const response = await api.post(`/SuperAdmin/RevokeToken/${userId}`);
    return response.data;
};
// --- المستخدمين (جديد) ---
export const unBanUser = async (userId: string): Promise<any> => {
    const response = await api.post(`/SuperAdmin/UnbanUser/${userId}`);
    return response.data;
};
export const fetchActiveUsers = async (): Promise<any> => {
    const response = await api.get('/SuperAdmin/ActiveUsers');
    return response.data?.data ?? response.data;
};

export const fetchBannedUsers = async (): Promise<any> => {
    const response = await api.get('/SuperAdmin/BannedUsers');
    return response.data?.data ?? response.data;
};

export const deleteUser = async (userId: string): Promise<any> => {
    // بناءً على الـ Swagger، userId يُرسل كـ query parameter
    const response = await api.delete('/SuperAdmin/DeleteUser', { params: { userId } });
    return response.data;
};

// --- الطلبيات (جديد) ---
export const fetchFilterOrders = async (params: OrderFilterParams): Promise<any> => {
    // 1. نأخذ نسخة من المعاملات لنتمكن من تعديلها
    const cleanParams: any = { ...params };

    // 2. إذا كانت حالة الطلب فارغة، نحذف المفتاح تماماً من الطلب
    if (!cleanParams.orderStatus || cleanParams.orderStatus === '') {
        delete cleanParams.orderStatus;
    }

    // 3. نرسل المعاملات النظيفة
    const response = await api.get('/SuperAdmin/GetAllFilterOrders', { params: cleanParams });
    
    return response.data?.data ?? response.data;
};


// ==========================================
// 3️⃣ Hooks (الخطافات)
// ==========================================

// --- المتاجر والأدوار ---

// هوك جلب تصنيفات متجر معين
export const useStoreCategories = (storeId: number) => {
    return useQuery({
        queryKey: ['storeCategories', storeId],
        queryFn: () => fetchStoreCategories(storeId),
        enabled: !!storeId,
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


// --- المستخدمين (جديد ومحدث) ---

// هوك سحب صلاحية مستخدم
// export const useRevokeToken = () => {
//     return useMutation({
//         mutationFn: revokeToken,
//         onSuccess: () => console.log("✅ تم سحب التوكن بنجاح"),
//     });
// };
export const useRevokeToken = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: revokeToken,
        onSuccess: async () => { // 👈 إضافة async
            // 👈 استخدام Promise.all و await لانتظار تحميل القوائم الجديدة
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['activeUsers'] }),
                queryClient.invalidateQueries({ queryKey: ['bannedUsers'] })
            ]);
            
            toast.success("✅ تم سحب التوكن بنجاح");
        },
    });
};

export const useUnbanUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: unBanUser,
        onSuccess: async () => { // 👈 إضافة async
            // 👈 استخدام Promise.all و await لانتظار تحميل القوائم الجديدة
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['activeUsers'] }),
                queryClient.invalidateQueries({ queryKey: ['bannedUsers'] })
            ]);
            
            toast.success("✅ تم إلغاء حظر المستخدم بنجاح");
        },
    });
};
// هوك جلب المستخدمين النشطين
export const useActiveUsers = () => {
    return useQuery({
        queryKey: ['activeUsers'],
        queryFn: fetchActiveUsers,
    });
};

// هوك جلب المستخدمين المحظورين
export const useBannedUsers = () => {
    return useQuery({
        queryKey: ['bannedUsers'],
        queryFn: fetchBannedUsers,
    });
};

// هوك حذف مستخدم
// ✅ التعديل (Route Param)
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.delete('/SuperAdmin/DeleteUser', {
                params: { userId } // 👈 تمرير الـ Query Param بالشكل الصحيح
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeUsers'] });
            queryClient.invalidateQueries({ queryKey: ['bannedUsers'] });
        },
        onError: (error: any) => {
            // استخراج نص الخطأ العائد من الباك إند
            const backendError = error.response?.data?.message || error.response?.data || 'تعذر حذف المستخدم';
            alert(typeof backendError === 'string' ? backendError : 'حدث خطأ في السيرفر أثناء عملية الحذف');
        }
    });
};
export const fetchStoreFiles = async (storeId: number): Promise<any> => {
    // الانتباه لمسار الـ API كما ذكرت في الطلب
    const response = await api.get(`/StoreRequest/GetFilesByStore/${storeId}`);
    return response.data?.data ?? response.data;
};

// ==========================================
// إضافة الـ Hook الخاص بملفات المتجر
// ==========================================

export const useStoreFiles = (storeId?: number) => {
    return useQuery({
        queryKey: ['storeFiles', storeId],
        queryFn: () => fetchStoreFiles(storeId!),
        // سيتم تفعيل الطلب فقط إذا كان هناك storeId (عندما يضغط المستخدم على عرض المتجر)
        enabled: !!storeId, 
    });
};
// --- الطلبيات (جديد) ---

// هوك جلب الطلبيات مع الفلترة
export const useFilterOrders = (params: OrderFilterParams) => {
    return useQuery({
        queryKey: ['filterOrders', params],
        queryFn: () => fetchFilterOrders(params),
    });
};