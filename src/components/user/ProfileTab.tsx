// components/UserProfile/ProfileTab.tsx
import React from 'react';
import toast from 'react-hot-toast';
import { useUserProfile, useUpdateProfilePhoto } from '../../hooks/useUser';
import { getSecureImageUrl } from '../../constant/imageURL';

export default function ProfileTab() {
    const { data: userProfile, isLoading: userLoading } = useUserProfile();
    const updatePhotoMutation = useUpdateProfilePhoto();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            toast.promise(
                updatePhotoMutation.mutateAsync(file),
                {
                    loading: 'جاري رفع وتحديث الصورة... ⏳',
                    success: 'تم تحديث صورتك الشخصية بنجاح! 🎉',
                    error: 'حدث خطأ أثناء رفع الصورة.',
                }
            );
        }
    };

    if (userLoading) return <p className="text-sm text-gray-500">جاري تحميل بيانات الحساب... ⏳</p>;

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">إعدادات الحساب</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-amber-400 shadow-inner flex-shrink-0">
                    <img
                        src={userProfile?.profilePhoto ? getSecureImageUrl(userProfile?.profilePhoto) : localStorage.getItem('userPhoto')!}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1">
                        تعديل الصورة
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                </div>
                <div className="text-center sm:text-right flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {userProfile?.firstName ? `مرحباً بك، ${userProfile.firstName} ${userProfile.lastName}` : 'مرحباً بك في لوحتك الخاصة'}
                    </h3>
                    <div className="space-y-1 mb-3">
                        {userProfile?.email && <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-2">✉️ {userProfile.email}</p>}
                        {userProfile?.phoneNumber && <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-2">📱 {userProfile.phoneNumber}</p>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 bg-white inline-block px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                        💡 يمكنك الضغط على الصورة مباشرة لتحميل صورة جديدة.
                    </p>
                </div>
            </div>
        </div>
    );
}