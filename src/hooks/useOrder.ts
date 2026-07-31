import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

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
// حدد شكل الاستجابة القادمة من السيرفر
interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}


// جلب جميع الطلبات
export const fetchAllOrders = async (): Promise<OrderData[]> => {
    const response = await api.get('/Order/GetAllOrder');
    return response.data?.data ?? response.data;
};
// أضف النوع (Type) إلى دالة useQuery
export const useAllOrders = () => {
    return useQuery<ApiResponse<any>>({
        queryKey: ['orders'],
        queryFn: fetchAllOrders as any
    });
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



// جلب تفاصيل طلب محدد بالـ ID (إن احتجتها لاحقاً)
export const fetchOrderById = async (orderId: number): Promise<OrderData> => {
    const response = await api.get(`/Order/GetOrderById/${orderId}`);
    return response.data?.data ?? response.data;
};

// ==========================================
// Hooks
// ==========================================

// ... (الهوكس السابقة الخاصة بك)
// الواجهة المطلوبة فقط
export interface CheckoutPayload {
    address: string;
}

// إضافة طلب جديد (الدفع / Checkout)
export const addCheckout = async (data: CheckoutPayload): Promise<any> => {
    // إرسال الكائن { address: "string" }
    const response = await api.post('/Order/AddCheckout', data);
    return response.data;
};

// ==========================================
// Hooks
// ==========================================
export const useAddCheckout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addCheckout,
        onSuccess: () => {
            // تحديث قائمة الطلبات وسلة المشتريات بعد نجاح الدفع
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });
};

export const useOrderById = (orderId: number | null) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderById(orderId as number),
        enabled: !!orderId,
    });
};
// --- أضف هذه الواجهة ---
export interface UpdateOrderStatusPayload {
    orderId: number;
    status: 'Processing' | 'Cancelled' | 'Delivered';
}

// --- أضف دالة الاتصال بالـ API ---
export const updateOrderStatus = async (data: UpdateOrderStatusPayload): Promise<any> => {
    // نرسل orderId كـ Query Parameter والـ status في الـ Body
    const response = await api.put('/Order/UpdateOrderStatus', 
        { status: data.status }, 
        { params: { orderId: data.orderId } }
    );
    return response.data;
};

// --- أضف الـ Hook ---
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            // تحديث قائمة الطلبات بعد تغيير حالة أي طلب بنجاح
            queryClient.invalidateQueries({ queryKey: ['filterOrders'] });
            toast.success("✅ تم تحديث حالة الطلب بنجاح");
        },
        onError: () => {
            toast.error("❌ حدث خطأ أثناء تحديث الحالة");
        }
    });
};