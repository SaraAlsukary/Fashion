import React, { useRef } from 'react';
// افترض أنك وضعت الهوك في هذا المسار، قم بتعديله إذا كان مختلفاً
import { useUpdateProfilePhoto, useUserProfile } from '../../hooks/useUser';

const MyProfile = () => {
    const { data: user, isLoading: isFetchingUser, isError } = useUserProfile();

    // استدعاء هوك تحديث الصورة
    // ملاحظة: إذا كنت تستخدم React Query v4 استخدم isLoading بدلاً من isPending
    const { mutate: updatePhoto, isPending: isUpdatingPhoto } = useUpdateProfilePhoto();

    // مرجع لمدخل الملفات المخفي
    const fileInputRef = useRef<HTMLInputElement>(null);

    // دالة التعامل مع اختيار الصورة
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            updatePhoto(file);
        }
        // تصفير القيمة حتى يتمكن المستخدم من اختيار نفس الصورة مرة أخرى إذا أراد
        if (event.target) {
            event.target.value = '';
        }
    };

    if (isFetchingUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-slate-600 font-medium">جاري تحميل بيانات الملف الشخصي...</div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى لاحقاً.
            </div>
        );
    }

    const getGenderLabel = (gender: string) => {
        if (gender === 'Male') return 'ذكر';
        if (gender === 'Female') return 'أنثى';
        return gender;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">الملف الشخصي</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* الجزء العلوي - الغلاف */}
                {/* استخدمنا لوناً محايداً (slate) ليتناسب مع كل من Super Admin و Transfer Agent */}
                <div className="h-32 bg-slate-700"></div>

                <div className="px-6 sm:px-8 pb-8 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-12 sm:-mt-16 relative z-10">

                    {/* حاوية الصورة الشخصية */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 group">
                        <div className="w-full h-full bg-white rounded-full p-1 shadow-md overflow-hidden relative">
                            {user.profilePhoto ? (
                                <img
                                    src={`http://www.marketexpress.somee.com/${user.profilePhoto}`}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-4xl font-bold">
                                    {user.firstName.charAt(0)}
                                </div>
                            )}

                            {/* شاشة تحميل شفافة تظهر أثناء رفع الصورة */}
                            {isUpdatingPhoto && (
                                <div className="absolute inset-1 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* زر تغيير الصورة الكاميرا */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUpdatingPhoto}
                            className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 bg-white p-2 rounded-full shadow border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="تغيير الصورة الشخصية"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* مدخل ملفات مخفي */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="text-center sm:text-right flex-1 pb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                        <p className="text-gray-500" dir="ltr">@{user.userName}</p>
                    </div>
                </div>

                {/* تفاصيل المعلومات */}
                <div className="px-6 sm:px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">المعلومات الشخصية</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                            <p className="font-medium text-gray-900" dir="ltr">{user.email}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                            <p className="font-medium text-gray-900" dir="ltr">{user.phoneNumber || 'غير محدد'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">تاريخ الميلاد</p>
                            <p className="font-medium text-gray-900">
                                {user.birthDate
                                    ? new Date(user.birthDate).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'غير محدد'
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">الجنس</p>
                            <p className="font-medium text-gray-900">{getGenderLabel(user.gender)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;