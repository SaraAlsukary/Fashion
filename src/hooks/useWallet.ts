import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// واجهة مؤقتة لشكل بيانات المحفظة (يمكنك تعديلها بناءً على ما يعيده السيرفر فعلياً)
export interface WalletData {
    id?: number;
    balance?: number;
    userId?: string;
    // أضف أي حقول أخرى يعيدها السيرفر هنا
}

// 1️⃣ جلب بيانات المحفظة
export const fetchWallet = async (): Promise<WalletData> => {
    const response = await api.get('/Wallet/GetWallet');
    // التعامل مع التغليف إذا كان السيرفر يضع البيانات داخل { data: ... }
    return response.data?.data ?? response.data;
};

// 2️⃣ إنشاء/إضافة محفظة جديدة
export const addWallet = async (): Promise<any> => {
    const response = await api.post('/Wallet/AddWallet');
    return response.data;
};

// ==========================================
// Hooks
// ==========================================

// هوك قراءة المحفظة
export const useWallet = () => {
    return useQuery({
        queryKey: ['userWallet'],
        queryFn: fetchWallet,
        // يمكنك إيقاف الجلب التلقائي إذا لم يكن المستخدم مسجلاً للدخول
        retry: 1,
    });
};

// هوك إنشاء المحفظة
export const useAddWallet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addWallet,
        onSuccess: (data) => {
            console.log("✅ تم إنشاء المحفظة بنجاح:", data);
            // تحديث بيانات المحفظة في الواجهة فوراً بعد إنشائها
            queryClient.invalidateQueries({ queryKey: ['userWallet'] });
        },
        onError: (error) => {
            console.error("❌ حدث خطأ أثناء إنشاء المحفظة:", error);
        }
    });
};