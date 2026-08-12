import { useGetAllPosts, usePostReaction } from '../../../hooks/usePosts';

// 1️⃣ تعريف خريطة التفاعلات
export const REACTION_MAP: Record<string, { emoji: string; label: string; color: string }> = {
    Like: { emoji: '👍', label: 'إعجاب', color: 'text-blue-600' },
    Love: { emoji: '❤️', label: 'أحببته', color: 'text-red-600' },
    Haha: { emoji: '😂', label: 'هاها', color: 'text-yellow-500' },
    Wow: { emoji: '😲', label: 'واو', color: 'text-yellow-600' },
    Sad: { emoji: '😢', label: 'حزين', color: 'text-blue-500' },
    Angry: { emoji: '😡', label: 'غاضب', color: 'text-red-500' },
};

export default function StorePosts({ storeId }: { storeId: number }) {
    const { data: postsData, isLoading } = useGetAllPosts(storeId);
    const { mutate: reactToPost } = usePostReaction();

    const posts = postsData?.data || (Array.isArray(postsData) ? postsData : []);

    // دالة تحويل رابط الصورة إلى HTTPS آمن عبر wsrv.nl Proxy
    const getSecureImageUrl = (imagePath: string | null) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('https://')) return imagePath;

        const rawUrl = imagePath.startsWith('http://')
            ? imagePath
            : `http://www.marketexpress.somee.com/${imagePath.replace(/^\//, '')}`;

        return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}`;
    };

    // دالة تنسيق رابط الوسائط الأخرى (الفيديوهات)
    const getMediaUrl = (urlPath: string | null) => {
        if (!urlPath) return '';
        if (urlPath.startsWith('https://')) return urlPath;
        return urlPath.startsWith('http://')
            ? urlPath
            : `http://www.marketexpress.somee.com/${urlPath.replace(/^\//, '')}`;
    };

    if (isLoading) return <div className="animate-pulse bg-white h-40 rounded-2xl"></div>;
    if (posts.length === 0) return <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border-dashed border">لا توجد منشورات حالياً.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">آخر الأخبار والعروض</h2>
            <div className="space-y-4">
                {posts.map((post: any) => {
                    // حساب إجمالي التفاعلات على المنشور
                    const totalReactions = post.postReactions?.reduce((acc: number, r: any) => acc + r.count, 0) || 0;
                    // جلب تفاعل المستخدم الحالي إن وجد
                    const myReactionData = post.myReaction ? REACTION_MAP[post.myReaction] : null;

                    return (
                        <div key={post.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-800 text-sm whitespace-pre-wrap mb-4">{post.content}</p>
                            
                            {/* صور وفيديوهات البوست */}
                            {post.postMedias && post.postMedias.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {post.postMedias.map((media: any, idx: number) => (
                                        media.mediaType === 'Video' ? (
                                            <video 
                                                key={idx} 
                                                src={getMediaUrl(media.mediaUrl)} 
                                                className="rounded-xl w-full h-48 object-cover border" 
                                                controls
                                                muted 
                                            />
                                        ) : (
                                            <img 
                                                key={idx} 
                                                src={getSecureImageUrl(media.mediaUrl)} 
                                                alt="post media" 
                                                className="rounded-xl w-full h-48 object-cover border" 
                                                onError={(e) => {
                                                    // إخفاء العنصر في حال فشل تحميل الصورة
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}

                            {/* 2️⃣ عرض عداد التفاعلات فوق الأزرار */}
                            {totalReactions > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 border-b pb-2">
                                    <div className="flex -space-x-1 rtl:space-x-reverse">
                                        {/* عرض أول 3 إيموجيات مستخدمة في هذا المنشور كأيقونات صغيرة */}
                                        {post.postReactions.slice(0, 3).map((r: any) => (
                                            <span key={r.reactionType} className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                {REACTION_MAP[r.reactionType]?.emoji}
                                            </span>
                                        ))}
                                    </div>
                                    <span>{totalReactions} تفاعل</span>
                                </div>
                            )}

                            {/* 3️⃣ زر التفاعل مع القائمة المنبثقة */}
                            <div className="flex gap-4 pt-1 relative group">  
                                {/* صندوق الإيموجيات المنبثق (يظهر عند الـ Hover) */}
                                <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-full px-3 py-2 flex gap-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 translate-y-2 group-hover:translate-y-0">
                                    {Object.entries(REACTION_MAP).map(([type, data]) => (
                                        <button 
                                            key={type} 
                                            onClick={() => reactToPost({ postId: post.id, reactionType: type as any })}
                                            className="text-2xl hover:scale-125 hover:-translate-y-1 transition-transform duration-200 origin-bottom"
                                            title={data.label}
                                        >
                                            {data.emoji}
                                        </button>
                                    ))}
                                </div>

                                {/* الزر الرئيسي (يُظهر التفاعل الحالي للمستخدم أو الزر الافتراضي) */}
                                <button 
                                    onClick={() => reactToPost({ postId: post.id, reactionType: post.myReaction || 'Like' })}
                                    className={`text-sm font-bold flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 ${myReactionData ? myReactionData.color : 'text-gray-500'}`}
                                >
                                    <span className="text-lg">{myReactionData ? myReactionData.emoji : '👍'}</span>
                                    <span>{myReactionData ? myReactionData.label : 'إعجاب'}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}