import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface OrderData {
    id: number;
    orderDate: string;
    totalPrice: number;
    status: string; // 'Pending', 'Completed', 'Cancelled', etc.
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
}

// جلب جميع الطلبات
export const fetchAllOrders = async (): Promise<OrderData[]> => {
    const response = await api.get('/Order/GetAllOrder');
    return response.data?.data ?? response.data;
};

// جلب عناصر طلب معين (Path Parameter)
export const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
    const response = await api.get(`/Order/GetOrderItems/${orderId}`);
    return response.data?.data ?? response.data;
};

// إلغاء طلب (Query Parameter)
export const cancelOrder = async (orderId: number): Promise<any> => {
    const response = await api.put('/Order/CancelOrder', null, {
        params: { orderId }
    });
    return response.data;
};

// ==========================================
// Hooks
// ==========================================

export const useAllOrders = () => {
    return useQuery({ queryKey: ['orders'], queryFn: fetchAllOrders });
};

export const useOrderItems = (orderId: number | null) => {
    return useQuery({
        queryKey: ['orderItems', orderId],
        queryFn: () => fetchOrderItems(orderId as number),
        enabled: !!orderId,
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });
};