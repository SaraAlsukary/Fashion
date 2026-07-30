// components/UserProfile/WalletTab.tsx
import { useWallet, useAddWallet } from '../../hooks/useWallet';
import { useAllTransactions } from '../../hooks/useTransaction';

export default function WalletTab() {
    const { data: wallet, isLoading: walletLoading, isError: walletError } = useWallet();
    const addWalletMutation = useAddWallet();
    const { data: transactions, isLoading: transactionsLoading } = useAllTransactions();

    if (walletLoading) return <p className="text-sm text-gray-500">جاري فحص المحفظة... ⏳</p>;

    if (walletError || !wallet) {
        return (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                <div className="text-4xl mb-3">👛</div>
                <h3 className="text-gray-900 font-bold mb-2">لا تملك محفظة إلكترونية بعد</h3>
                <p className="text-sm text-gray-500 mb-6">قم بإنشاء محفظتك الآن للبدء في تتبع رصيدك وعملياتك المالية.</p>
                <button
                    onClick={() => addWalletMutation.mutate()}
                    disabled={addWalletMutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                    {addWalletMutation.isPending ? 'جاري الإنشاء... ⏳' : '➕ إنشاء محفظتي الآن'}
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">الرصيد المالي والعمليات</h2>
            <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl text-white shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs opacity-90 font-medium mb-1">الرصيد المتاح حالياً</p>
                        <p className="text-4xl font-black">{wallet.balance ?? 0} <span className="text-lg font-bold">SYP</span></p>
                        {wallet.id && (
                            <div className="mt-5 pt-4 border-t border-white/20">
                                <p className="text-xs opacity-80 mb-1">معرف المحفظة (Wallet ID)</p>
                                <p className="text-xs font-mono bg-black/10 inline-block px-3 py-1.5 rounded-lg break-all select-all">{wallet.id}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">آخر التحركات المالية:</h3>
                    {transactionsLoading ? <p className="text-xs text-gray-400">جاري جلب العمليات... ⏳</p> : transactions && transactions.length > 0 ? (
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white px-4">
                            {transactions.map((tx: any) => (
                                <div key={tx.id} className="py-4 flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-bold text-gray-800">{tx.description || tx.transactionType}</p>
                                        <p className="text-xs text-gray-400 mt-1">{tx.date ? new Date(tx.date).toLocaleDateString('ar-EG') : ''}</p>
                                    </div>
                                    <span className={`font-extrabold ${tx.transactionType === 'Deposit' ? 'text-green-600' : 'text-red-500'}`} dir="ltr">
                                        {tx.transactionType === 'Withdrawal' || tx.transactionType === 'Purchase' ? '-' : '+'}{tx.amount} SYP
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl"><p className="text-sm text-gray-400 font-medium">لا توجد حركات مالية مسجلة.</p></div>}
                </div>
            </div>
        </div>
    );
}