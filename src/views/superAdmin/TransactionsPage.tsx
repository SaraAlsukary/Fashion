// src/views/SuperAdmin/TransactionsPage.tsx
// تأكد من المسار الصحيح للملف الذي وضعت فيه useAllTransactions
import { useAllTransactions } from '../../hooks/useTransaction'; 

const TransactionsPage = () => {
    const { data: transactions, isLoading, isError } = useAllTransactions();

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">سجل العمليات المالية للنظام</h1>
            
            {isLoading ? (
                <div className="text-center py-10 text-gray-500">جاري تحميل العمليات...</div>
            ) : isError ? (
                <div className="text-center py-10 text-red-500">حدث خطأ أثناء جلب البيانات.</div>
            ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">لا توجد عمليات مالية مسجلة.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600">
                                <th className="p-4 border-b font-medium">رقم العملية</th>
                                <th className="p-4 border-b font-medium">المبلغ</th>
                                <th className="p-4 border-b font-medium">النوع</th>
                                <th className="p-4 border-b font-medium">الوصف</th>
                                <th className="p-4 border-b font-medium">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 border-b text-gray-500">#{tx.id}</td>
                                    <td className="p-4 border-b font-bold text-gray-800">
                                        <span dir="ltr">${tx.amount}</span>
                                    </td>
                                    <td className="p-4 border-b">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            tx.transactionType === 'Deposit' ? 'bg-green-100 text-green-800' : 
                                            tx.transactionType === 'Withdrawal' ? 'bg-red-100 text-red-800' : 
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {tx.transactionType || 'عملية'}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b text-gray-600">{tx.description || 'لا يوجد وصف'}</td>
                                    <td className="p-4 border-b text-gray-500">
                                        {new Date(tx.date).toLocaleDateString('ar-EG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;