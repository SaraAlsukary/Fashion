import { useState } from 'react';
import toast from 'react-hot-toast';
import { useComplaints } from '../../../hooks/useComlaints'; // تأكد من المسار

interface Props {
    isOpen: boolean;
    onClose: () => void;
    storeId: number;
}

export default function ComplaintModal({ isOpen, onClose, storeId }: Props) {
    const { useAddComplaint } = useComplaints();
    const { mutate: addComplaint, isPending: isSubmitting } = useAddComplaint();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return toast.error("يرجى ملء جميع الحقول");

        addComplaint(
            { storeId, title, description },
            {
                onSuccess: () => {
                    setSuccessMsg('تم إرسال الشكوى بنجاح.');
                    setTitle('');
                    setDescription('');
                    toast.success("تم الإرسال بنجاح");
                    setTimeout(() => {
                        setSuccessMsg('');
                        onClose();
                    }, 2000);
                },
                onError: () => toast.error('حدث خطأ أثناء الإرسال.'),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                <h2 className="text-2xl font-bold mb-2">إرسال شكوى</h2>
                
                {successMsg ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-medium">✓ {successMsg}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="عنوان الشكوى"
                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none focus:border-moda-purple"
                            required
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="التفاصيل..."
                            className="w-full h-32 px-4 py-3 rounded-xl border bg-gray-50 outline-none focus:border-moda-purple resize-none"
                            required
                        />
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl text-white bg-moda-purple disabled:opacity-50 font-bold">
                            {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}