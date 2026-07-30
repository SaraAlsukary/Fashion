import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';


interface AddComplaintPayload {
    storeId: number;
    title: string;
    description: string;
}

export function useComplaints() {
    const queryClient = useQueryClient();

    // جلب كل الشكاوى (GET /api/Complaint/GetAllComplaints)
    const useGetAllComplaints = () => {
        return useQuery({
            queryKey: ['complaints'],
            queryFn: async () => {
                const response = await api.get(`/Complaint/GetAllComplaints`);
                return response.data;
            },
        });
    };

    // إضافة شكوى جديدة (POST /api/Complaint/AddComplaint)
    const useAddComplaint = () => {
        return useMutation({
            mutationFn: async (newComplaint: AddComplaintPayload) => {
                const response = await api.post(`/Complaint/AddComplaint`, newComplaint);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['complaints'] });
            },
        });
    };

    // جلب رسائل شكوى محددة (GET /api/Message/GetMessagesByComplaintId/{complaintId})
    const useGetMessagesByComplaintId = (complaintId: number | null) => {
        return useQuery({
            queryKey: ['messages', complaintId],
            queryFn: async () => {
                if (!complaintId) return null;
                const response = await api.get(`/Message/GetMessagesByComplaintId/${complaintId}`);
                return response.data;
            },
            enabled: !!complaintId,
        });
    };

    // قراءة/تحديث الرسالة (PUT /api/Message/ReadMessage)
    const useReadMessage = () => {
        return useMutation({
            mutationFn: async (complaintId: number) => {
                const response = await api.put(`/Message/ReadMessage`, { complaintId });
                return response.data;
            },
            onSuccess: (_, complaintId) => {
                queryClient.invalidateQueries({ queryKey: ['messages', complaintId] });
            },
        });
    };

    return {
        useGetAllComplaints,
        useAddComplaint,
        useGetMessagesByComplaintId,
        useReadMessage,
    };
}