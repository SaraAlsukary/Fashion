import { Link } from 'react-router-dom';
import { useGetProducts } from '../../hooks/useProduct';
import { useGetStoreCategories } from '../../hooks/useStoreCategory';
import { useUserProfile } from '../../hooks/useUser';
import { useGetStoresByAdmin } from '../../hooks/useStore'; // 1. استيراد هوك المتجر

const DashboardPage = () => {
    const { data: user } = useUserProfile();
    
    // 2. جلب بيانات المتجر واستخراج رقم المتجر
    const { data: store, isLoading: isLoadingStores } = useGetStoresByAdmin();
    const storeId = store?.id;

    // 3. جلب المنتجات بناءً على رقم المتجر (storeId)
    const { data: products, isLoading: isLoadingProducts } = useGetProducts(storeId);
    const { data: categories, isLoading: isLoadingCategories } = useGetStoreCategories();

    // 4. حساب الإحصائيات (ملاحظة: المنتجات تأتي بداخل products.data حسب الـ API الخاص بك)
    const totalProducts = products?.data?.length || 0;
    const totalCategories = categories?.length || 0;

    // بيانات وهمية مؤقتة للطلبات والأرباح
    const mockOrders = 24;
    const mockRevenue = 1540;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">نظرة عامة على المتجر</h1>
                <p className="text-gray-500 text-sm">
                    {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* بطاقة المنتجات */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">إجمالي المنتجات</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isLoadingProducts || isLoadingStores ? '...' : totalProducts}
                        </h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                </div>

                {/* بطاقة الفئات */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">الفئات النشطة</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isLoadingCategories ? '...' : totalCategories}
                        </h3>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                </div>

                {/* بطاقة الطلبات (مؤقتة) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">الطلبات الجديدة</p>
                        <h3 className="text-2xl font-bold text-gray-800">{mockOrders}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                </div>

                {/* بطاقة الإيرادات (مؤقتة) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">إجمالي الإيرادات</p>
                        <h3 className="text-2xl font-bold text-gray-800">${mockRevenue}</h3>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* الجزء السفلي: الإجراءات السريعة وأحدث المنتجات */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* الإجراءات السريعة */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">إجراءات سريعة</h2>
                    <div className="space-y-3">
                        <Link to="/admin/products/add" className="flex items-center p-3 text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                            <span className="text-xl ml-3">+</span>
                            إضافة منتج جديد
                        </Link>
                        <Link to="/admin/categories" className="flex items-center p-3 text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition">
                            <span className="text-xl ml-3">📁</span>
                            إدارة الفئات
                        </Link>
                        <Link to="/admin/attributes" className="flex items-center p-3 text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-green-600 rounded-lg transition">
                            <span className="text-xl ml-3">🎨</span>
                            إضافة ألوان ومقاسات
                        </Link>
                    </div>
                </div>

                {/* أحدث المنتجات المضافة */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800">أحدث المنتجات</h2>
                        <Link to="/admin/products" className="text-blue-500 hover:underline text-sm">عرض الكل</Link>
                    </div>

                    {isLoadingProducts || isLoadingStores ? (
                        <p className="text-gray-500 text-center py-4">جاري التحميل...</p>
                    ) : products?.data && products.data.length > 0 ? (
                        <div className="space-y-4">
                            {/* عرض آخر 3 منتجات فقط باستخدام .slice(0, 3) على مصفوفة data */}
                            {products.data.slice(0, 3).map((product: any) => (
                                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={`http://www.marketexpress.somee.com/${product.image}`}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-md bg-gray-200"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                            {/* عرض جزء من الوصف كنوع من التفاصيل */}
                                            <p className="text-sm text-gray-500 truncate w-32 sm:w-48">
                                                {product.description || 'لا يوجد وصف'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-700 whitespace-nowrap">
                                        {product.price} $
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">لا توجد منتجات مضافة بعد.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;