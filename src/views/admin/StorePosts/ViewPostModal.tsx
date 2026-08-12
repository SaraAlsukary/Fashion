import { getMediaUrl, getSecureImageUrl } from "../../../constant/imageURL";
import { REACTION_MAP } from "../../store/StoreDetails/StorePosts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    post: any;
}

export default function ViewPostModal({ isOpen, onClose, post }: Props) {
    if (!isOpen || !post) return null;

    // حساب إجمالي التفاعلات للأدمن
    const totalReactions = post.postReactions?.reduce((acc: number, r: any) => acc + r.count, 0) || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 p-4 md:p-10">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-full flex flex-col shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">تفاصيل المنشور</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 bg-white shadow-sm rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-purple-100 text-moda-purple px-3 py-1 rounded-full text-xs font-bold">
                            {post.visibility === 'Public' ? '🌍 عام' : '👥 للمتابعين'}
                        </span>
                        <span className="text-gray-400 text-xs text-left w-full" dir="ltr">
                            {new Date(post.createdAt).toLocaleString('ar-EG')}
                        </span>
                    </div>

                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg mb-6">
                        {post.content}
                    </p>

                    {post.postMedias && post.postMedias.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {post.postMedias.map((media: any, idx: number) => (
                                media.mediaType === 'Video' ? (
                                    <video key={idx}src={getMediaUrl(media.mediaUrl)}  controls className="w-full h-64 object-cover rounded-2xl border bg-black" />
                                ) : (
                                                
                                <img key={idx} src={getSecureImageUrl(media.mediaUrl)} 
                                        alt="media" className="w-full h-64 object-cover rounded-2xl border" />
                                )
                            ))}
                        </div>
                    )}

                    {/* 📊 قسم عرض إحصائيات التفاعلات للأدمن */}
                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-500 mb-3">إحصائيات التفاعل ({totalReactions})</h4>

                        {post.postReactions && post.postReactions.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {post.postReactions.map((reaction: any) => {
                                    const reactionData = REACTION_MAP[reaction.reactionType];
                                    if (!reactionData) return null;

                                    return (
                                        <div key={reaction.reactionType} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                                            <span className="text-lg">{reactionData.emoji}</span>
                                            <span className="text-sm font-bold text-gray-700">{reaction.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">لا توجد تفاعلات على هذا المنشور حتى الآن.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}