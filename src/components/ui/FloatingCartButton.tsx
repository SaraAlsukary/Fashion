import { useState } from 'react';
import { useGetCartItems } from '../../hooks/useCart';
import FloatingCart from './FloatingCart';

export default function FloatingCartButton() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { data: cartResponse } = useGetCartItems();

    // جلب عدد عناصر السلة ديناميكياً
    const cartItemsCount = cartResponse?.data?.length || 0;

    return (
        <>
            {/* 🛍️ الزر العائم المثبت أسفل الشاشة */}
            <button
                onClick={() => setIsCartOpen(true)}
                // تم وضعه في أسفل اليسار (bottom-6 left-6) لأنه يناسب الواجهات العربية (RTL) ولا يغطي أزرار الصعود لأعلى التي تكون غالباً في اليمين
                className="fixed bottom-6 left-6 z-40 bg-moda-purple text-white w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border border-white/20 group"
                title="عرض سلة التسوق"
            >
                {/* تأثير نبضي (Wave) خلف الزر لجذب انتباه المستخدم إذا كانت السلة تحتوي على منتجات */}
                {cartItemsCount > 0 && (
                    <span className="absolute inset-0 rounded-full bg-moda-purple animate-ping opacity-25 group-hover:opacity-0 transition-opacity"></span>
                )}

                {/* الأيقونة المطلوبة */}
                <span className="text-2xl relative z-10">🛍️</span>

                {/* العداد الديناميكي مع تأثير القفز المدعوم من Tailwind */}
                {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-md">
                        {cartItemsCount}
                    </span>
                )}
            </button>

            {/* مكوّن السلة الجانبية (Sidebar Cart) الذي قمنا بتصميمه سابقاً */}
            <FloatingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}