interface Props {
    store: any;
}

export default function StoreInfo({ store }: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 justify-between">
            {/* 1. وصف المتجر */}
            <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">عن المتجر</h3>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-lg">ℹ️</span>
                    <p className="leading-relaxed">
                        {store.description || store.storeDescription || 'لا يوجد وصف متوفر لهذا المتجر حالياً.'}
                    </p>
                </div>
            </div>

            {/* 2. معلومات التواصل */}
            <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">معلومات التواصل</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span className="font-semibold">العنوان:</span> 
                        {store.address || 'غير متوفر'}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-lg">📞</span>
                        <span className="font-semibold">رقم الهاتف:</span> 
                        <span dir="ltr">{store.storePhoneNumber || store.phoneNumber || 'غير متوفر'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-lg">✉️</span>
                        <span className="font-semibold">البريد الإلكتروني:</span> 
                        {store.storeEmail || store.email || 'غير متوفر'}
                    </li>
                </ul>
            </div>

            {/* 3. ساعات العمل */}
            <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">ساعات العمل</h3>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-lg">🕒</span>
                    <p className="leading-relaxed">
                        {store.workingHours || 'من الساعة 9:00 صباحاً حتى 10:00 مساءً'}
                    </p>
                </div>
            </div>
        </div>
    );
}