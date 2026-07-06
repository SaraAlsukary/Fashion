import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// 1️⃣ واجهات البيانات (Interfaces)
// قم بتعديل الحقول بناءً على ما يقبله السيرفر وما يعيده بالضبط
export interface AddTransactionPayload {
    amount: number;
    transactionType?: string; // مثلاً: 'Deposit', 'Withdrawal', 'Purchase'
    description?: string;
}

export interface TransactionData {
    id: number;
    amount: number;
    date: string;
    transactionType: string;
    description: string;
}

// 2️⃣ دوال الاتصال بالـ API
export const fetchAllTransactions = async (): Promise<TransactionData[]> => {
    const response = await api.get('/Transaction/GetAllTransactions');
    return response.data?.data ?? response.data;
};

export const addTransaction = async (payload: AddTransactionPayload): Promise<any> => {
    const response = await api.post('/Transaction/AddTransaction', payload);
    return response.data;
};

// ==========================================
// 3️⃣ Hooks
// ==========================================

// هوك جلب سجل العمليات
export const useAllTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: fetchAllTransactions,
    });
};

// هوك إضافة عملية مالية جديدة
export const useAddTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addTransaction,
        onSuccess: (data) => {
            console.log("✅ تم تنفيذ العملية المالية بنجاح:", data);

            // 🔥 حركة احترافية: تحديث سجل العمليات وتحديث رصيد المحفظة في نفس الوقت!
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['userWallet'] });
        },
        onError: (error) => {
            console.error("❌ فشل تنفيذ العملية المالية:", error);
        }
    });
};