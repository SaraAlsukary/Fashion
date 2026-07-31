import { useState, useEffect } from 'react';
import { useAddPost, useUpdatePost } from '../../../hooks/usePosts';
import { type PostVisibility } from '../../../hooks/usePosts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    storeId: number;
    postToEdit?: any | null;
}

export default function PostFormModal({ isOpen, onClose, storeId, postToEdit }: Props) {
    // استدعِ mutateAsync بدلاً من mutate
    const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();
    const { mutateAsync: addPost, isPending: isAdding } = useAddPost();
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<PostVisibility>('Public');
    const [files, setFiles] = useState<FileList | null>(null);

    useEffect(() => {
        if (postToEdit) {
            setContent(postToEdit.content || '');
            setVisibility(postToEdit.visibility || 'Public');
            setFiles(null);
        } else {
            setContent('');
            setVisibility('Public');
            setFiles(null);
        }
    }, [postToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storeId || isNaN(storeId)) {
            alert('رقم المتجر غير صحيح');
            return;
        }

        const formData = new FormData();

        formData.append('Content', content);
        formData.append('Visibility', visibility);
        formData.append('StoreId', storeId.toString());

        if (files && files.length > 0) {
            const selectedFile = files[0];

            // تحديد نوع الملف بناءً على صيغته
            const isVideo = selectedFile.type.startsWith('video/');
            const mediaType = isVideo ? 'Video' : 'Image';

            formData.append('mediaDtos[0].file', selectedFile);
            formData.append('mediaDtos[0].mediaType', mediaType); // إرسال النوع الصحيح
            formData.append('mediaDtos[0].duration', '0');
        }

        try {
            if (postToEdit) {
                await updatePost({ postId: postToEdit.id, formData });
            } else {
                await addPost(formData);
            }
            onClose();
        } catch (err) {
            console.error("فشلت عملية النشر:", err);
        }
    };
    const isSubmitting = isAdding || isUpdating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {postToEdit ? '✏️ تعديل المنشور' : '📝 إنشاء منشور جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ... (حقول المحتوى والخصوصية كما هي) ... */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">محتوى المنشور</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="اكتب تفاصيل العرض أو الخبر هنا..."
                            className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-moda-purple outline-none transition-all resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">من يمكنه الرؤية؟</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-moda-purple outline-none"
                        >
                            <option value="Public">العامة (Public)</option>
                            <option value="Followers">المتابعين فقط (Followers)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">إرفاق صورة أو فيديو (اختياري)</label>
                        <input
                            type="file"
                            accept="image/*,video/*" // 👈 تم التعديل للسماح بالفيديوهات والصور
                            onChange={(e) => setFiles(e.target.files)}
                            className="w-full px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-moda-purple hover:file:bg-purple-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl text-white bg-moda-purple hover:bg-purple-700 active:scale-[0.98] disabled:opacity-70 transition-all font-bold text-lg"
                    >
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ ونشر'}
                    </button>
                </form>
            </div>
        </div>
    );
}