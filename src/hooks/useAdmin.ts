import { useQuery } from '@tanstack/react-query';
import api from '../services/api'; // تأكد من مسار ملف الـ Axios الخاص بك

// ================= API Functions =================


export const getProductInventoryAlertApi = async () => {
    const response = await api.get('/Admin/GetProductInventoryAlert');
    return response.data;
};

export const getAllDiscountProductByStoreApi = async () => {
    const response = await api.get('/Admin/GetAllDiscountProductByStore');
    return response.data;
};

export const getProductDashboardApi = async (pageNumber: number, pageSize: number) => {
    // نستخدم params لتمرير القيم في الـ URL
    const response = await api.get('/Admin/GetProductDashboard', {
        params: {
            pageNumber,
            pageSize
        }
    });
    return response.data;
};

export const getDashboardAnalyticsApi = async () => {
    const response = await api.get('/Admin/GetDashboardAnalytics');
    return response.data;
};

export const getDashboardSummaryApi = async () => {
    const response = await api.get('/Admin/GetDashboardSummary');
    return response.data;
};

// ================= Custom Hooks =================
// تحديث دالة الجلب لتقبل التواريخ
export const getOrdersDetailApi = async (startDate?: string, endDate?: string) => {
    // تجهيز المعاملات وإرسالها فقط إذا كانت تحتوي على قيمة
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/Admin/GetOrdersDetail', { params });
    return response.data;
};

// تحديث الـ Hook ليعتمد على التواريخ ويعيد جلب البيانات عند تغيرها
export const useGetOrdersDetail = (startDate?: string, endDate?: string) => {
    return useQuery({
        // إضافة المتغيرات إلى queryKey لكي يعمل React Query على تحديث البيانات عند تغيير التاريخ
        queryKey: ['adminOrdersDetail', startDate, endDate],
        queryFn: () => getOrdersDetailApi(startDate, endDate),
    });
};
export const useGetProductInventoryAlert = () => {
    return useQuery({
        queryKey: ['adminInventoryAlert'],
        queryFn: getProductInventoryAlertApi,
    });
};

export const useGetAllDiscountProductByStore = () => {
    return useQuery({
        queryKey: ['adminDiscountProducts'],
        queryFn: getAllDiscountProductByStoreApi,
    });
};

// الـ Hook
export const useGetProductDashboard = (pageNumber: number, pageSize: number) => {
    return useQuery({
        // يجب إضافة المتغيرات هنا لكي يتحدث الجدول عند تغيير الصفحة
        queryKey: ['adminProductDashboard', pageNumber, pageSize],
        queryFn: () => getProductDashboardApi(pageNumber, pageSize),
    });
};
export const useGetDashboardAnalytics = () => {
    return useQuery({
        queryKey: ['adminDashboardAnalytics'],
        queryFn: getDashboardAnalyticsApi,
    });
};

export const useGetDashboardSummary = () => {
    return useQuery({
        queryKey: ['adminDashboardSummary'],
        queryFn: getDashboardSummaryApi,
    });
};

// تأكد من تعديل الرابط حسب الـ API الفعلي لديك لجلب منتج واحد
export const useGetProductDetails = (productId: number | null) => {
    return useQuery({
        queryKey: ['productDetails', productId],
        queryFn: async () => {
            const response = await api.get(`/Admin/GetProductById/${productId}`);
            return response.data;
        },
        // الهووك لن يعمل تلقائياً إلا إذا كان هناك productId (عند فتح المودال)
        enabled: !!productId,
    });
};