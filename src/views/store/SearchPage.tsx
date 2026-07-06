import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // أو حسب المكتبة التي تستخدميها
import api from '../../services/api'; // تأكدي من مسار الـ api الخاص بك

export default function SearchPage() {
    // 1️⃣ قراءة الكلمة من الرابط (مثلاً: ?q=فستان)
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // 2️⃣ جلب النتائج من السيرفر
    const { data, isLoading } = useQuery({
        queryKey: ['search', query],
        queryFn: async () => {
            const { data } = await api.get(`/Product/Search?keyword=${encodeURIComponent(query)}`);
            return data;
        },
        enabled: !!query, // لا تبدأ الطلب إلا إذا كانت هناك كلمة بحث
    });

    return (
        <div className="container mx-auto px-6 py-12" dir="rtl">
            <h1 className="text-2xl font-black text-gray-900 mb-6">
                نتائج البحث عن: <span className="text-moda-purple">"{query}"</span>
            </h1>

            {isLoading ? (
                <div className="text-center py-20">جاري البحث...</div>
            ) : data?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((product: any) => (
                        <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-xl" />
                            <h3 className="font-bold mt-3">{product.name}</h3>
                            <p className="text-moda-purple font-black">{product.price} ل.س</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    لم يتم العثور على نتائج مطابقة لـ "{query}".
                </div>
            )}
        </div>
    );
}