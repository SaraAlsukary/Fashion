// قم بتعديل مسار الاستيراد بناءً على مكان حفظ ملف الـ Hooks الخاص بك
import { 
    useGetDashboardSummary, 
    useGetDashboardAnalytics, 
    useGetProductInventoryAlert 
} from '../../hooks/useAdmin'; 

const AdminDashboard = () => {
    // 1. استخدام الـ Hooks لجلب البيانات
    const { 
        data: summaryData, 
        isLoading: isSummaryLoading, 
        isError: isSummaryError 
    } = useGetDashboardSummary();

    const { 
        data: analyticsData, 
        isLoading: isAnalyticsLoading 
    } = useGetDashboardAnalytics();

    const { 
        data: inventoryAlerts, 
        isLoading: isAlertsLoading 
    } = useGetProductInventoryAlert();

    // 2. التعامل مع حالة التحميل (Loading State)
    // يمكنك دمج حالات التحميل إذا كنت تريد عرض شاشة تحميل واحدة للصفحة بالكامل
    const isLoading = isSummaryLoading || isAnalyticsLoading || isAlertsLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>جاري تحميل بيانات لوحة التحكم...</p>
                {/* يمكنك وضع Spinner هنا */}
            </div>
        );
    }

    // 3. التعامل مع حالة الخطأ (Error State)
    if (isSummaryError) {
        return (
            <div className="text-red-500 text-center mt-10">
                حدث خطأ أثناء جلب بيانات لوحة التحكم. يرجى المحاولة لاحقاً.
            </div>
        );
    }

    // 4. عرض البيانات (Data Rendering)
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">لوحة تحكم الإدارة</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* قسم الملخص */}
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">الملخص</h2>
                    {/* نستخدم Optional Chaining (?.) لتجنب الأخطاء إذا كانت البيانات غير موجودة بعد */}
                    <p>إجمالي الطلبات: {summaryData?.totalOrders || 0}</p>
                    <p>إجمالي المبيعات: {summaryData?.totalSales || 0} $</p>
                </div>

                {/* قسم التحليلات */}
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">التحليلات</h2>
                    <p>الزيارات اليوم: {analyticsData?.dailyVisits || 0}</p>
                    <p>معدل التحويل: {analyticsData?.conversionRate || 0}%</p>
                </div>

                {/* قسم تنبيهات المخزون */}
                <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">تنبيهات المخزون</h2>
                    {inventoryAlerts?.length > 0 ? (
                        <ul>
                            {inventoryAlerts.map((product:any) => (
                                <li key={product.id} className="mb-1">
                                    {product.name} - <span className="font-bold text-red-500">الكمية: {product.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-green-600">جميع المنتجات متوفرة بكميات كافية.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;