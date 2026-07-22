// src/views/SuperAdmin/DashboardPage.tsx

const DashboardPage = () => {
    // بيانات وهمية للإحصائيات حتى يتم توفير API خاص بها
    const stats = [
        { id: 1, title: 'إجمالي المتاجر', value: '150', color: 'bg-blue-500' },
        { id: 2, title: 'الطلبات المعلقة', value: '12', color: 'bg-yellow-500' },
        { id: 3, title: 'إجمالي المستخدمين', value: '1,240', color: 'bg-green-500' },
        { id: 4, title: 'العمليات المالية اليوم', value: '$3,400', color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">نظرة عامة</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 space-x-reverse border-r-4" style={{ borderColor: stat.color.replace('bg-', '') }}>
                        <div className={`p-4 rounded-full text-white ${stat.color}`}>
                            {/* يمكنك استبدال هذا بأيقونات من مكتبة مثل react-icons */}
                            <span className="text-xl font-bold">#</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">مرحباً بك في لوحة الإدارة العليا</h2>
                <p className="text-gray-600">
                    من خلال هذه اللوحة يمكنك إدارة طلبات المتاجر، مراقبة العمليات المالية، التحكم في أدوار المستخدمين، وإدارة النظام بشكل كامل.
                </p>
            </div>
        </div>
    );
};

export default DashboardPage;