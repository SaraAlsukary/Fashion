import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api'; // افترضنا أن هذا مسار ملف أكسيوس الخاص بك
import toast from 'react-hot-toast';

// واجهات البيانات (Interfaces) المتوقعة للسلة
export interface CartItem {
    id: number; // معرف عنصر السلة نفسه
    productId: number;
    productName: string;
    price: number;
    priceAfterDiscount?: number;
    color: string;
    size: string;
    image: string;
    quantity: number;
}

// 1️⃣ جلب عناصر السلة (GET)
export const useGetCartItems = () => {
    return useQuery({
        queryKey: ['cartItems'],
        queryFn: async () => {
            const { data } = await api.get('/Cart/GetCartItems');
            return data;
        },
    });
};

// 2️⃣ إضافة منتج إلى السلة (POST)
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { quantity: number; productSizeId: number }) => {
            // نمرر الـ payload مباشرة كـ Body وهو المطلوب في السيرفر
            const { data } = await api.post('/Cart/AddToCart', payload);
            return data;
        },
        onSuccess: () => {
            toast.success('تم اضافة المنتج للسلة')
            // تأكد من تحديث السلة تلقائياً عند النجاح
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        },
    });
};

// 3️⃣ تحديث كمية عنصر في السلة (PUT)
export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { cartItemId: number; quantity: number }) => {
            const { data } = await api.put('/Cart/UpdateCartItem', payload, {
                params: { cartItemId: payload.cartItemId }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        },
    });
};

// 4️⃣ حذف عنصر من السلة (DELETE)
// 3️⃣ حذف عنصر من السلة
export const useDeleteCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (cartItemId: number) => {
            // ❌ لا ترسل الـ ID في الرابط (كما كان سابقاً)
            // ✅ أرسله كـ Body داخل كائن data لأن Axios يتطلب ذلك في طلبات الـ DELETE
            const { data } = await api.delete(`/Cart/DeleteCartItem`, {
                data: {
                    cartItemIds: [cartItemId] // نضع الـ ID داخل مصفوفة كما طلب الباك-أند
                }
            });
            return data;
        },
        // إعادة جلب السلة فوراً بعد نجاح الحذف ليختفي العنصر ويتحدث العداد
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        },
    });
};