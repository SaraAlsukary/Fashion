import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const CartProvider = ({ children }:{children:React.ReactNode}) => {
    const [cartItems, setCartItems] = useState([]);
    const { isAuthenticated } = useAuth();
 
    // جلب عناصر السلة من السيرفر عند دخول المستخدم
    const fetchCart = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/Cart/GetCartItems');
            setCartItems(response.data);
        } catch (error) {
            console.error("خطأ في جلب عناصر السلة", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    // إضافة منتج للسلة /api/Cart/AddToCart
    const addToCart = async (productId:number, quantity = 1) => {
        try {
            await api.post('/Cart/AddToCart', { productId, quantity });
            fetchCart(); // تحديث السلة بعد الإضافة
            return true;
        } catch (error) {
            console.error("خطأ في إضافة المنتج للسلة", error);
            return false;
        }
    };

    // حذف منتج من السلة /api/Cart/DeleteCartItem
    const removeFromCart = async (cartItemId:number) => {
        try {
            await api.delete(`/Cart/DeleteCartItem`, { data: { cartItemId } });
            setCartItems(prev => prev.filter((item:any) => item.id !== cartItemId));
        } catch (error) {
            console.error("خطأ في حذف المنتج", error);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);