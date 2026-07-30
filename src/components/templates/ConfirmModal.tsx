// components/UserProfile/ConfirmModal.tsx

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    isLoading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmModal({ isOpen, title, message, isLoading, onConfirm, onClose }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform scale-100 animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border-4 border-red-100 mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? 'جاري الإلغاء... ⏳' : 'نعم، قم بالإلغاء'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                        تراجع
                    </button>
                </div>
            </div>
        </div>
    );
}