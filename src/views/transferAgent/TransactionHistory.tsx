import { useAllTransactions } from '../../hooks/useTransaction'; // مسار الـ hook الخاص بك

const TransactionHistory = () => {
    const { data: transactions, isLoading, isError, error } = useAllTransactions();

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">جاري تحميل السجل...</div>;
    }

    if (isError) {
        return <div className="p-6 text-center text-red-500">حدث خطأ أثناء جلب البيانات: {(error as Error).message}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">سجل التحويلات</h2>

            {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-3 font-semibold text-gray-700">رقم العملية</th>
                                <th className="p-3 font-semibold text-gray-700">التاريخ</th>
                                <th className="p-3 font-semibold text-gray-700">النوع</th>
                                <th className="p-3 font-semibold text-gray-700">المبلغ</th>
                                <th className="p-3 font-semibold text-gray-700">الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-gray-600">#{tx.id}</td>
                                    <td className="p-3 text-gray-600" dir="ltr">
                                        {new Date(tx.date).toLocaleString('ar-EG')}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            tx.transactionType === 'Deposit' ? 'bg-green-100 text-green-700' : 
                                            tx.transactionType === 'Withdrawal' ? 'bg-red-100 text-red-700' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {tx.transactionType}
                                        </span>
                                    </td>
                                    <td className="p-3 font-bold text-gray-800" dir="ltr">
                                        {tx.amount.toLocaleString()} 
                                    </td>
                                    <td className="p-3 text-gray-600">{tx.description || '---'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    لا توجد تحويلات سابقة.
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;