import { useWallet, useAddWallet } from '../../hooks/useWallet'; // مسار الـ hook الخاص بالمحفظة

const TransferAgentDashboard = () => {
    const { data: walletData, isLoading, isError } = useWallet();
    const { mutate: createWallet, isPending: isCreatingWallet } = useAddWallet();

    if (isLoading) {
        return <div className="p-6 text-gray-500">جاري تحميل بيانات المحفظة...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">نظرة عامة على المحفظة</h1>

            {isError || !walletData ? (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                    <p className="text-yellow-700 mb-4 font-medium">لا توجد محفظة نشطة مرتبطة بحسابك حالياً.</p>
                    <button 
                        onClick={() => createWallet()}
                        disabled={isCreatingWallet}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                    >
                        {isCreatingWallet ? 'جاري الإنشاء...' : 'إنشاء محفظة جديدة'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* بطاقة الرصيد */}
                    <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-emerald-100 text-sm font-medium mb-1">الرصيد المتاح</p>
                            <h2 className="text-4xl font-bold" dir="ltr">
                                {walletData.balance?.toLocaleString()} <span className="text-xl text-emerald-200">SYP</span>
                            </h2>
                            <p className="mt-4 text-emerald-100 text-sm">
                                معرف المحفظة: <br/> {walletData.id || 'N/A'}
                            </p>
                        </div>
                        {/* شكل زخرفي للبطاقة */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransferAgentDashboard;