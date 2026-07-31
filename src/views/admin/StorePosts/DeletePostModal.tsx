import { useDeletePost } from '../../../hooks/usePosts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    postId: number | null;
}

export default function DeletePostModal({ isOpen, onClose, postId }: Props) {
    const { mutate: deletePost, isPending } = useDeletePost();

    if (!isOpen || !postId) return null;

    const handleDelete = () => {
        deletePost(postId, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🗑️
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-900">هل أنت متأكد؟</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    هل تريد حقاً حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isPending} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                        إلغاء
                    </button>
                    <button onClick={handleDelete} disabled={isPending} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
                        {isPending ? 'جاري الحذف...' : 'نعم، احذف'}
                    </button>
                </div>
            </div>
        </div>
    );
}