import { useNavigate } from 'react-router-dom';
import { useGetCartItems, useUpdateCartItem, useDeleteCartItem } from '../../hooks/useCart';

interface FloatingCartProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FloatingCart({ isOpen, onClose }: FloatingCartProps) {
    const navigate = useNavigate();

    // استدعاء الـ Hooks الخاصة بالسلة
    const { data: cartResponse, isLoading } = useGetCartItems();
    const updateCartItemMutation = useUpdateCartItem();
    const deleteCartItemMutation = useDeleteCartItem();

    // 1️⃣ التعديل الجذري: استخراج المصفوفة بشكل صحيح من cartItemDto
    const cartItems = cartResponse?.data?.cartItemDto || [];

    // 2️⃣ التعديل الجذري: لا حاجة لدالة reduce المعقدة، السيرفر يرسل المجموع جاهزاً
    const totalAmount = cartResponse?.data?.totalPrice || 0;

    const handleQuantityChange = (cartItemId: number, currentQty: number, change: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;
        updateCartItemMutation.mutate({ cartItemId, quantity: newQty });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 overflow-hidden font-sans" dir="rtl">
            {/* الخلفية المظلمة الشفافة عند فتح السلة */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 left-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col rounded-r-3xl border-r border-gray-100">

                    {/* الهيدر الخاص بالسلة الجانبية */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <span>🛍️</span> سلة التسوق ({cartItems.length})
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                            ✕
                        </button>
                    </div>

                    {/* محتوى المنتجات داخل السلة */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-full text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moda-purple mb-2"></div>
                                <span className="text-xs">جاري تحميل السلة...</span>
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-gray-400 space-y-3">
                                <span className="text-4xl">🛒</span>
                                <p className="font-bold text-sm">سلتك فارغة حالياً</p>
                            </div>
                        ) : (
                            // 3️⃣ مسحنا cartItems.data واستخدمنا cartItems مباشرة لأنها أصبحت مصفوفة
                            cartItems.map((item: any) => (
                                // 4️⃣ مفاتيح السيرفر الحقيقية: cartItemId و productImage
                                <div key={item.cartItemId} className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 relative group">
                                    <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img src={item.productImage} alt={`Product ${item.productId}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">منتج #{item.productId}</h4>
                                            <p className="text-[11px] text-gray-400 mt-0.5">اللون: {item.color} | المقاس: {item.size}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            {/* أزرار التحكم بالكمية */}
                                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-0.5 scale-90 origin-right">
                                                <button
                                                    onClick={() => handleQuantityChange(item.cartItemId, item.quantity, -1)}
                                                    className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 rounded-md"
                                                >
                                                    -
                                                </button>
                                                <span className="w-5 text-center font-bold text-xs text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.cartItemId, item.quantity, 1)}
                                                    className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 rounded-md"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <span className="font-black text-sm text-moda-purple">
                                                {((item.priceAfterDiscount || item.price) * item.quantity).toLocaleString()} ل.س
                                            </span>
                                        </div>
                                    </div>

                                    {/* زر الحذف */}
                                    <button
                                        onClick={() => deleteCartItemMutation.mutate(item.cartItemId)}
                                        className="absolute top-2 left-2 text-gray-300 hover:text-red-500 transition-colors text-xs p-1"
                                        title="حذف"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* الفوتر الخاص بالسلة الإجمالي وزر المزيد */}
                    {cartItems.length > 0 && (
                        <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50 rounded-tr-3xl">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">المجموع الإجمالي:</span>
                                <span className="text-xl font-black text-gray-900">{totalAmount.toLocaleString()} ل.س</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/cart');
                                    }}
                                    className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 text-center"
                                >
                                    عرض السلة الكاملة (المزيد) 🔍
                                </button>
                                <button
                                    className="flex-1 py-3.5 bg-moda-purple text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 text-center"
                                >
                                    إتمام الشراء 💳
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}