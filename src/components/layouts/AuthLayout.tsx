import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div dir="rtl" className="min-h-screen bg-moda-lightBg flex font-sans">
            {/* القسم الأيمن: النماذج (Forms) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 z-10 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.03)]">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="mb-10 text-center lg:text-right">
                        <Link to="/" className="inline-block mb-6">
                            <h1 className="text-3xl font-black text-moda-purple tracking-wider">
                                موضة<span className="text-moda-gold">.</span>
                            </h1>
                        </Link>
                    </div>

                    {/* هنا سيتم عرض (Login أو Register أو OTP) */}
                    <Outlet />

                </div>
            </div>

            {/* القسم الأيسر: صورة جمالية مع تدرج لوني (يظهر فقط في الشاشات الكبيرة) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden animated-hero-bg items-center justify-center">
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                <div className="relative z-10 text-center text-white px-12 animate-fade-in-up delay-200">
                    <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">خطوتك الأولى نحو الأناقة</h2>
                    <p className="text-lg text-gray-200 font-light max-w-md mx-auto">
                        انضم إلى مجتمعنا واكتشف أحدث صيحات الموضة من أشهر المتاجر العالمية بأسعار لا تُنافس.
                    </p>
                </div>
            </div>
        </div>
    );
}