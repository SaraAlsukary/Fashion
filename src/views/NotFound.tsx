import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center animate-fade-in">
            <div className="max-w-md space-y-6">

                {/* رقم الـ 404 بتصميم كبير وأنيق */}
                <h1 className="text-9xl font-extrabold text-moda-purple tracking-widest select-none animate-pulse">
                    404
                </h1>

                {/* صندوق الرسالة */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900">عذراً، الصفحة غير موجودة!</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        يبدو أن الرابط الذي تحاول الوصول إليه غير صحيح، أو أنه تم نقله أو حذفه. لا تقلق، يمكنك دائماً العودة إلى بر الأمان!
                    </p>
                </div>

                {/* زر العودة للرئيسية بنفس ستايل أزرارك السابقة */}
                <div>
                    <Link
                        to="/"
                        className="inline-block bg-moda-purple hover:bg-moda-purpleHover text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                        العودة إلى الصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}