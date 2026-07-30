import { useQuery } from '@tanstack/react-query';
import api from '../services/api'; // تأكد من مسار ملف الـ Axios الخاص بك

// ================= API Functions =================

export const getOrdersDetailApi = async () => {
    const response = await api.get('/Admin/GetOrdersDetail');
    return response.data;
};

export const getProductInventoryAlertApi = async () => {
    const response = await api.get('/Admin/GetProductInventoryAlert');
    return response.data;
};

export const getAllDiscountProductByStoreApi = async () => {
    const response = await api.get('/Admin/GetAllDiscountProductByStore');
    return response.data;
};

export const getProductDashboardApi = async () => {
    const response = await api.get('/Admin/GetProductDashboard');
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

export const useGetOrdersDetail = () => {
    return useQuery({
        queryKey: ['adminOrdersDetail'],
        queryFn: getOrdersDetailApi,
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

export const useGetProductDashboard = () => {
    return useQuery({
        queryKey: ['adminProductDashboard'],
        queryFn: getProductDashboardApi,
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