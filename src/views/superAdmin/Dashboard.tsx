// src/views/SuperAdmin/DashboardPage.tsx

const DashboardPage = () => {
    // روابط الوصول السريع بناءً على الأقسام المتوفرة لديك
    const quickActions = [
        {
            id: 1,
            title: 'إدارة طلبات المتاجر',
            description: 'مراجعة، قبول، أو رفض طلبات الانضمام الجديدة للمتاجر.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            // يمكنك تغيير المسار حسب إعدادات الـ Router لديك
            link: '/super-admin/requests'
        },
        {
            id: 2,
            title: 'إدارة المستخدمين',
            description: 'عرض المستخدمين النشطين، المحظورين، وإدارة صلاحياتهم.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            link: '/super-admin/users'
        },
        {
            id: 3,
            title: 'متابعة الطلبات (Orders)',
            description: 'تتبع حالات الطلبات، وتحديثها (قيد التنفيذ، ملغى، تم التسليم).',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            link: '/super-admin/orders'
        },
    ];

    return (
        <div className="space-y-8" dir="rtl">
            {/* قسم الترحيب */}
            <div className="bg-gradient-to-l from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم العليا 👋</h1>
                    <p className="text-blue-100 text-lg max-w-2xl">
                        من خلال هذه اللوحة، يمكنك إدارة كافة جوانب النظام بسلاسة. اختر أحد الأقسام أدناه للبدء في إدارة المتاجر، المستخدمين، أو متابعة الطلبات.
                    </p>
                </div>
                {/* تأثير بصري في الخلفية (اختياري) */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-10 w-40 h-40 bg-white opacity-10 rounded-full translate-y-1/2 blur-xl"></div>
            </div>

            {/* قسم الوصول السريع */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    الوصول السريع
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <div
                            key={action.id}
                            // إذا كنت تستخدم react-router-dom، يمكنك استبدال هذا الـ div بـ <Link to={action.link}>
                            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full`}
                            onClick={() => window.location.href = action.link}
                        >
                            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 ${action.bgColor} ${action.color} border ${action.borderColor}`}>
                                {action.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{action.title}</h3>
                            <p className="text-gray-500 text-sm flex-grow leading-relaxed">
                                {action.description}
                            </p>

                            <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 gap-1">
                                <span>الانتقال للقسم</span>
                                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            
        </div>
    );
};

export default DashboardPage;