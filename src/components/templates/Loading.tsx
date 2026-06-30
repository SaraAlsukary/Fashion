
const Loading = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-5 animate-fade-in-up">
        {/* تأثير الدوران المزدوج الاحترافي بألوان الهوية */}
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-moda-purple border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-moda-gold border-b-transparent rounded-full animate-spin-reverse"></div>
        </div>

        {/* نص تفاعلي */}
        <div className="text-center">
            <h3 className="text-moda-purple font-bold text-lg tracking-wider">موضة<span className="text-moda-gold">.</span></h3>
            <p className="text-sm text-gray-400 animate-pulse mt-1">جاري تحضير الأناقة...</p>
        </div>
    </div>
);

export default Loading