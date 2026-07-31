import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';


// المكونات الفرعية (Sub-components)
import StoreHeader from './StoreHeader';
import StoreInfo from './StoreInfo';
import StoreProducts from './StoreProducts';
import StorePosts from './StorePosts';
import ComplaintModal from './ComplaintModal';
import { useGetAllStores } from '../../../hooks/useStore';
import { useGetStoreFollowersCount, useToggleStoreFollow } from '../../../hooks/useStoreFollowers';

export default function StoreDetails() {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const currentStoreId = storeId ? parseInt(storeId) : 0;

    const { data: storeResponse, isLoading: isLoadingStore } = useGetAllStores();
    const { mutate: toggleFollow, isPending: isTogglingFollow } = useToggleStoreFollow();
    const { data: followersData, isLoading: isLoadingFollowers } = useGetStoreFollowersCount(currentStoreId);

    const followersCount = followersData?.data ?? followersData ?? 0;
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);

    const currentStore = storeResponse?.data?.find((s: any) => s.id === currentStoreId)
        || (Array.isArray(storeResponse?.data) ? storeResponse?.data[0] : storeResponse?.data);

    useEffect(() => {
        if (currentStore?.isFollowed !== undefined) {
            setIsFollowing(currentStore.isFollowed);
        }
    }, [currentStore]);

    const handleToggleFollow = () => {
        toggleFollow(currentStoreId, {
            onSuccess: () => {
                setIsFollowing((prev) => !prev);
                toast.success(!isFollowing ? "تمت المتابعة" : "تم إلغاء المتابعة");
            },
            onError: () => toast.error("حدث خطأ"),
        });
    };

    if (isLoadingStore) return <div className="text-center py-24">جاري التحميل...</div>;
    if (!currentStore) return <div className="text-center py-24 text-red-500">المتجر غير موجود!</div>;

    return (
        <div className="container mx-auto px-6 py-8 space-y-8">
            <button onClick={() => navigate(-1)} className="font-bold text-gray-600 hover:text-moda-purple">
                &rarr; رجوع
            </button>

            {/* 1. الترويسة */}
            <StoreHeader 
                store={currentStore} 
                followersCount={followersCount}
                isLoadingFollowers={isLoadingFollowers}
                isFollowing={isFollowing}
                isTogglingFollow={isTogglingFollow}
                onToggleFollow={handleToggleFollow}
                onOpenComplaint={() => setShowComplaintModal(true)}
            />

            {/* 2. معلومات الاتصال (قم بإنشائه كملف منفصل كما فعلنا أعلاه) */}
            <StoreInfo store={currentStore} />

            {/* تقسيم الشاشة إلى عمودين في الشاشات الكبيرة: المنتجات والبوستات */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 3. قسم البوستات (يأخذ ثلث المساحة) */}
                <div className="lg:col-span-1">
                    <StorePosts storeId={currentStoreId} />
                </div>

                {/* 4. قسم المنتجات (يأخذ ثلثي المساحة) */}
                <div className="lg:col-span-2">
                    {/* قم بنقل الكود القديم للمنتجات إلى هذا المكون */}
                    <StoreProducts storeId={currentStoreId} /> 
                </div>

            </div>

            {/* 5. نافذة الشكاوى */}
            <ComplaintModal 
                isOpen={showComplaintModal} 
                onClose={() => setShowComplaintModal(false)} 
                storeId={currentStoreId} 
            />
        </div>
    );
}