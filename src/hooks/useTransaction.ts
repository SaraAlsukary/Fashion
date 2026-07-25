import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// 👇 تحديث الواجهة لتطابق الـ API الجديد
export interface AddTransactionPayload {
    walletId: string;
    amount: number;
}

export interface TransactionData {
    id: number;
    amount: number;
    date: string;
    transactionType: string;
    description: string;
}

export const fetchAllTransactions = async (): Promise<TransactionData[]> => {
    const response = await api.get('/Transaction/GetAllTransactions');
    return response.data?.data ?? response.data;
};

export const addTransaction = async (payload: AddTransactionPayload): Promise<any> => {
    const response = await api.post('/Transaction/AddTransaction', payload);
    return response.data;
};

// ==========================================
// Hooks
// ==========================================

export const useAllTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: fetchAllTransactions,
    });
};

export const useAddTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addTransaction,
        onSuccess: (data) => {
            console.log("✅ تم تنفيذ العملية بنجاح:", data);
            // تحديث البيانات تلقائياً
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['userWallet'] });
        },
        onError: (error) => {
            console.error("❌ فشل تنفيذ العملية:", error);
        }
    });
};