import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// 1️⃣ واجهة البيانات (Interface)
export interface PaymentData {
    id: number;
    orderId: number;
    amount: number;
    status: string; // مثلاً: 'Pending', 'Completed', 'Failed'
    paymentMethod: string;
    paymentDate: string;
}

// 2️⃣ دالة الاتصال بالـ API
export const fetchPayment = async (orderId: number): Promise<PaymentData> => {
    const response = await api.get('/Payment/GetPayment', {
        params: { orderId: orderId } // هكذا نرسل الـ Query Parameter في Axios
    });

    return response.data?.data ?? response.data;
};

// ==========================================
// 3️⃣ Hook
// ==========================================

export const usePaymentDetails = (orderId: number | null | undefined) => {
    return useQuery({
        // نضع orderId ضمن الـ queryKey لكي يتم تحديث الكاش تلقائياً إذا تغير رقم الطلب
        queryKey: ['paymentDetails', orderId],
        queryFn: () => fetchPayment(orderId as number),
        // 🔥 مهم جداً: لا تقم بتنفيذ الطلب إذا لم يتم تمرير رقم طلب صحيح
        enabled: !!orderId,
    });
};