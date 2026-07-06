import { useState } from 'react';
import { useGetComments, useAddComment, useDeleteComment, useUpdateComment } from '../../hooks/useComments';

interface CommentsSectionProps {
    productId: number;
}

export default function CommentsSection({ productId }: CommentsSectionProps) {
    const [commentText, setCommentText] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentText, setEditCommentText] = useState('');

    const { data: commentsResponse, isLoading: isLoadingComments } = useGetComments({
        productId,
        pageNumber: 1,
        pageSize: 10
    });

    const comments = commentsResponse?.data || [];
    const addCommentMutation = useAddComment(productId);
    const deleteCommentMutation = useDeleteComment(productId);
    const updateCommentMutation = useUpdateComment(productId);

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        addCommentMutation.mutate({
            content: commentText,
            productId
        }, {
            onSuccess: () => setCommentText('')
        });
    };

    const openDeleteModal = (id: number) => {
        setCommentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (commentToDelete) {
            deleteCommentMutation.mutate(commentToDelete, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCommentToDelete(null);
                }
            });
        }
    };

    const startEditing = (id: number, text: string) => {
        setEditingCommentId(id);
        setEditCommentText(text);
    };

    const handleUpdateComment = (id: number) => {
        if (!editCommentText.trim()) return;
        updateCommentMutation.mutate({
            commentId: id,
            content: editCommentText
        }, {
            onSuccess: () => {
                setEditingCommentId(null);
                setEditCommentText('');
            }
        });
    };

    return (
        <div className="mt-12 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-6 border-r-4 border-moda-purple pr-3">
                آراء وتعلـيقات العملاء ({comments.length})
            </h2>

            <form onSubmit={handleAddComment} className="mb-8 space-y-3">
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="اكتب مراجعتك أو تعليقك حول المنتج هنا..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-moda-purple/20 focus:border-moda-purple transition-all resize-none"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${!commentText.trim() || addCommentMutation.isPending
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-moda-purple text-white hover:bg-moda-purpleHover active:scale-95'
                            }`}
                    >
                        {addCommentMutation.isPending ? 'جاري النشر... ⏳' : 'نشر التعليق 🚀'}
                    </button>
                </div>
            </form>

            {isLoadingComments ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2].map(n => <div key={n} className="h-20 bg-gray-50 rounded-2xl"></div>)}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pl-2">
                    {comments.map((comment: any) => (
                        <div key={comment.commentId} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-start justify-between gap-4 group">
                            <div className="flex gap-3 w-full">
                                <div className="w-10 h-10 rounded-full bg-moda-purple/10 text-moda-purple flex items-center justify-center font-black text-sm uppercase shrink-0">
                                    {comment.userFullName?.charAt(0) || 'U'}
                                </div>
                                <div className="w-full">
                                    <div className="flex justify-between items-center w-full">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{comment.userFullName}</h4>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(comment.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                {comment.updatedAt && ' (مُعدل)'}
                                            </p>
                                        </div>
                                    </div>

                                    {editingCommentId === comment.commentId ? (
                                        <div className="mt-3 w-full">
                                            <textarea
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-moda-purple resize-none"
                                                rows={2}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleUpdateComment(comment.commentId)}
                                                    disabled={updateCommentMutation.isPending}
                                                    className="px-3 py-1.5 bg-moda-purple text-white text-xs font-bold rounded-lg"
                                                >
                                                    {updateCommentMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">{comment.text}</p>
                                    )}
                                </div>
                            </div>

                            {editingCommentId !== comment.commentId && (
                                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                                    <button onClick={() => startEditing(comment.commentId, comment.text)} className="text-gray-400 hover:text-blue-500 p-1.5 rounded-lg">✏️</button>
                                    <button onClick={() => openDeleteModal(comment.commentId)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg">🗑️</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 text-sm">لا توجد تعليقات على هذا المنتج بعد. كن أول من يعلق!</div>
            )}

            {/* 🛑 Modal تأكيد الحذف */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
                        <h3 className="text-lg font-black text-center text-gray-900 mb-2">تأكيد الحذف</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">هل أنت متأكد أنك تريد حذف هذا التعليق نهائياً؟</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl">إلغاء</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl">{deleteCommentMutation.isPending ? 'جاري الحذف...' : 'حذف التعليق'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}