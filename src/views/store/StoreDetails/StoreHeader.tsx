interface Props {
    store: any;
    followersCount: number;
    isLoadingFollowers: boolean;
    isFollowing: boolean;
    isTogglingFollow: boolean;
    onToggleFollow: () => void;
    onOpenComplaint: () => void;
}

export default function StoreHeader({ store, followersCount, isLoadingFollowers, isFollowing, isTogglingFollow, onToggleFollow, onOpenComplaint }: Props) {
    
    // دالة تحويل رابط الصورة إلى HTTPS آمن عبر wsrv.nl
    const getSecureImageUrl = (imagePath: string | null) => {
        if (!imagePath) return '/placeholder-store.png';
        if (imagePath.startsWith('https://')) return imagePath;

        const rawUrl = imagePath.startsWith('http://')
            ? imagePath
            : `http://www.marketexpress.somee.com/${imagePath.replace(/^\//, '')}`;

        return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}`;
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-48 md:h-64 bg-gradient-to-r from-purple-900 via-indigo-800 to-moda-purple relative"></div>
            <div className="p-6 md:p-8 relative pt-0 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-5 -mt-16 z-10 text-center md:text-right">
                    <div className="w-32 h-32 bg-white rounded-2xl p-2 border shadow-md shrink-0">
                        <img
                            // استخدام الدالة هنا
                            src={getSecureImageUrl(store.logo)}
                            alt={store.storeName}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                                // صورة بديلة في حال فشل التحميل
                                (e.target as HTMLImageElement).src = '/placeholder-store.png';
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black bg-white mt-0 md:mt-6 text-center text-purple-900">{store.storeName}</h1>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-gray-400 font-bold text-sm">👥 المتابعين:</span>
                            {isLoadingFollowers ? <div className="animate-pulse bg-gray-200 h-4 w-8 rounded-md"></div> : <span className="font-bold text-moda-purple">{followersCount}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 z-10 mb-2">
                    <button onClick={onOpenComplaint} className="px-6 py-3 rounded-full font-bold text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                        إرسال شكوى ⚠️
                    </button>
                    <button onClick={onToggleFollow} disabled={isTogglingFollow} className={`px-8 py-3 rounded-full font-bold text-sm ${isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-moda-purple text-white'}`}>
                        {isTogglingFollow ? '⏳...' : isFollowing ? 'إلغاء المتابعة' : 'متابعة +'}
                    </button>
                </div>
            </div>
        </div>
    );
}