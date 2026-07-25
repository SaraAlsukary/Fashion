import React, { useState } from 'react';
import { useAddTransaction } from '../../hooks/useTransaction';
import toast from 'react-hot-toast';

const NewTransaction = () => {
    const { mutate: addTransaction, isPending } = useAddTransaction();

    const [formData, setFormData] = useState({
        walletId: '',
        amount: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(formData.amount) <= 0) {
            toast.error('يجب أن يكون المبلغ أكبر من صفر');
            return;
        }

        if (!formData.walletId.trim()) {
            toast.error('يرجى إدخال معرف المحفظة (Wallet ID)');
            return;
        }

        const payload = {
            walletId: formData.walletId.trim(),
            amount: Number(formData.amount)
        };

        toast.promise(
            new Promise((resolve, reject) => {
                addTransaction(payload, {
                    onSuccess: (data) => {
                        setFormData({ walletId: '', amount: '' });
                        resolve(data);
                    },
                    onError: (error) => {
                        reject(error);
                    }
                });
            }),
            {
                loading: 'جاري المعالجة... ⏳',
                success: 'تم إرسال المبلغ بنجاح! 🎉',
                error: (err) => `فشل التنفيذ: ${err.message || 'تأكد من صحة البيانات والرصيد'}`
            }
        );
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100" dir="rtl">
            <h2 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2">
                💸 تحويل رصيد جديد
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        معرف المحفظة المستهدفة (Wallet ID)
                    </label>
                    <input
                        type="text"
                        required
                        placeholder=" 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009966] focus:border-[#009966] transition-all outline-none text-left"
                        dir="ltr"
                        value={formData.walletId}
                        onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ (SYP)</label>
                    <input
                        type="number"
                        min="1"
                        dir='rtl'
                        step="any"
                        required
                        placeholder="أدخل المبلغ هنا"
                        className="w-full text-right px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009966] focus:border-[#009966] transition-all outline-none text-left"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending || !formData.amount || !formData.walletId}
                    // 👇 تم تطبيق الألوان هنا: الأساسي للزر، والداكن عند التمرير (hover)
                    className="w-full bg-[#009966] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#006045] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 shadow-sm mt-4"
                >
                    {isPending ? 'جاري التحويل...' : 'تأكيد التحويل'}
                </button>
            </form>
        </div>
    );
};

export default NewTransaction;