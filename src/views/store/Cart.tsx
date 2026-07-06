import { useNavigate } from 'react-router-dom';
import { useGetCartItems, useUpdateCartItem, useDeleteCartItem } from '../../hooks/useCart';

export default function CartPage() {
    const navigate = useNavigate();
    const { data: cartResponse, isLoading } = useGetCartItems();
    const updateCartItemMutation = useUpdateCartItem();
    const deleteCartItemMutation = useDeleteCartItem();

    // 1️⃣ استخراج المصفوفة بشكل صحيح من cartItemDto
    const cartItems = cartResponse?.data?.cartItemDto || [];

    // 2️⃣ الاعتماد على المجموع الإجمالي القادم من السيرفر مباشرة
    const totalAmount = cartResponse?.data?.totalPrice || 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-40 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moda-purple"></div>
                <span className="mr-3 font-medium">جاري تحميل سلة التسوق...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 font-sans" dir="rtl">
            <h1 className="text-3xl font-black text-gray-900 mb-8 border-r-4 border-moda-purple pr-3">
                سلة التسوق الكاملة 🛒
            </h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-4">
                    <span className="text-6xl">🛍️</span>
                    <h3 className="text-xl font-bold text-gray-700">لا توجد منتجات في سلتك بعد!</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">تصفح أقسام المتجر وأضف منتجاتك المفضلة لتظهر هنا في السلة.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-2 px-6 py-2.5 bg-moda-purple text-white text-sm font-bold rounded-xl shadow-md hover:opacity-90"
                    >
                        ابدأ التسوق الآن
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* جدول / قائمة المنتجات */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item: any) => (
                            <div key={item.cartItemId} className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                                <div className="w-24 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.productImage} alt={`Product ${item.productId}`} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div>
                                        <h3 className="font-black text-gray-900 text-base line-clamp-1">منتج #{item.productId}</h3>
                                        <p className="text-xs text-gray-400 mt-1">اللون: {item.color} | المقاس: {item.size}</p>
                                    </div>

                                    {/* التحكم بالكمية */}
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 w-max rounded-xl p-1">
                                        <button
                                            onClick={() => updateCartItemMutation.mutate({ cartItemId: item.cartItemId, quantity: Math.max(1, item.quantity - 1) })}
                                            className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 rounded-lg"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartItemMutation.mutate({ cartItemId: item.cartItemId, quantity: item.quantity + 1 })}
                                            className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 rounded-lg"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* السعر المالي الإجمالي للعنصر */}
                                    <div className="text-right md:text-left">
                                        <span className="text-lg font-black text-moda-purple">
                                            {((item.priceAfterDiscount || item.price) * item.quantity).toLocaleString()} ل.س
                                        </span>
                                    </div>
                                </div>

                                {/* زر الحذف */}
                                <button
                                    onClick={() => deleteCartItemMutation.mutate(item.cartItemId)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-2 absolute top-4 left-4"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ملخص الفاتورة */}
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm h-max space-y-6">
                        <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">ملخص الطلب</h2>

                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>إجمالي المنتجات:</span>
                                <span className="font-bold text-gray-900">{totalAmount.toLocaleString()} ل.س</span>
                            </div>
                            <div className="flex justify-between">
                                <span>تكلفة التوصيل:</span>
                                <span className="text-green-600 font-bold">مجاني</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                            <span className="font-black text-gray-900 text-base">المجموع النهائي:</span>
                            <span className="text-2xl font-black text-moda-purple">{totalAmount.toLocaleString()} ل.س</span>
                        </div>

                        <button className="w-full py-4 bg-moda-purple text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all text-center text-sm">
                            الانتقال لصفحة الدفع والشحن 💳
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}