import { useState } from 'react';
import { useGetAllPosts } from '../../../hooks/usePosts'; // عدل المسار

// استدعاء النوافذ المنبثقة
import PostFormModal from './PostFormModal';
import DeletePostModal from './DeletePostModal';
import ViewPostModal from './ViewPostModal';
import { useGetStoresByAdmin } from '../../../hooks/useStore';
import { getSecureImageUrl } from '../../../constant/imageURL';

export default function AdminStorePosts() {
    // جلب الـ ID الخاص بالمتجر من الرابط (أو من الـ Context لو كان محفوظاً هناك)
    const { data: store, isLoading: load } = useGetStoresByAdmin();
    const storeId = store?.id;
    const { data: postsData, isLoading } = useGetAllPosts(storeId);
    const posts = postsData?.data || (Array.isArray(postsData) ? postsData : []);

    // States للتحكم بالنوافذ المنبثقة
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    // دوال مساعدة لفتح النوافذ
    const openAdd = () => { setSelectedPost(null); setIsFormOpen(true); };
    const openEdit = (post: any) => { setSelectedPost(post); setIsFormOpen(true); };
    const openDelete = (post: any) => { setSelectedPost(post); setIsDeleteOpen(true); };
    const openView = (post: any) => { setSelectedPost(post); setIsViewOpen(true); };
    if (isLoading || load) return <div className="p-10 text-center animate-pulse">جاري تحميل المنشورات...</div>;

    return (
        <div className="bg-gray-50 min-h-screen p-6 md:p-10">
            {/* الترويسة الإدارية */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">إدارة المنشورات 📢</h1>
                    <p className="text-gray-500 text-sm mt-1">يمكنك إضافة، تعديل وحذف الأخبار والعروض الخاصة بمتجرك.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-moda-purple hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 w-full md:w-auto justify-center"
                >
                    <span>➕</span> منشور جديد
                </button>
            </div>

            {/* شبكة البوستات */}
            {posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className="text-xl font-bold text-gray-700">لا توجد منشورات بعد</h2>
                    <p className="text-gray-500 mt-2">انقر على "منشور جديد" للبدء بالتواصل مع عملائك.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post: any) => (
                        <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">

                            {/* عرض صورة مصغرة إذا كان هناك صور */}
                            {post.postMedias && post.postMedias.length > 0 && (
                                <div className="h-40 bg-gray-100 relative overflow-hidden group">
                                    {post.postMedias[0].mediaType === 'Video' ? (
                                        <>
                                            <video src={getSecureImageUrl(post.postMedias[0].mediaUrl)}
                                                className="w-full h-full object-cover" muted playsInline />
                                            {/* أيقونة تشغيل لتوضيح أنه فيديو */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                                                <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center pl-1 backdrop-blur-sm shadow-lg">
                                                    ▶️
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img src={getSecureImageUrl(post.postMedias[0].mediaUrl)} alt="Preview" className="w-full h-full object-cover" />
                                    )}

                                    {post.postMedias.length > 1 && (
                                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                                            +{post.postMedias.length - 1} ملفات
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="p-5 flex-grow flex flex-col">
                                <p className="text-gray-800 text-sm line-clamp-3 mb-4 flex-grow">{post.content}</p>

                                {/* أزرار التحكم بالمنشور (الأدمن) */}
                                <div className="flex gap-2 border-t pt-4 mt-auto">
                                    <button onClick={() => openView(post)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold transition-colors">
                                        👁️ عرض
                                    </button>
                                    <button onClick={() => openEdit(post)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                                        ✏️ تعديل
                                    </button>
                                    <button onClick={() => openDelete(post)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                                        🗑️ حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* المودالز (النوافذ المنبثقة) */}
            <PostFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                storeId={storeId}
                postToEdit={selectedPost}
            />

            <DeletePostModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                postId={selectedPost?.id}
            />

            <ViewPostModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                post={selectedPost}
            />
        </div>
    );
}