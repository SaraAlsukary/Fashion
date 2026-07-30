import { useState, useEffect } from 'react';
import { useComplaints } from '../../hooks/useComlaints';
import { useQueryClient } from '@tanstack/react-query'; // 👈 استيراد QueryClient
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'; // 👈 استيراد SignalR

export default function StoreComplaintsPage() {
    const { useGetAllComplaints, useGetMessagesByComplaintId, useReadMessage } = useComplaints();
    const queryClient = useQueryClient(); // 👈 تهيئة QueryClient لتحديث الكاش

    const { data: complaintsResponse, isLoading: isLoadingComplaints } = useGetAllComplaints();
    const complaintsList = complaintsResponse?.data || (Array.isArray(complaintsResponse) ? complaintsResponse : []);

    const [selectedComplaintId, setSelectedComplaintId] = useState(null);

    const { data: messagesResponse, isLoading: isLoadingMessages } = useGetMessagesByComplaintId(selectedComplaintId);
    const messagesList = messagesResponse?.data || (Array.isArray(messagesResponse) ? messagesResponse : []);

    const { mutate: markAsRead } = useReadMessage();

    // 👇 إضافة useEffect الخاص بـ SignalR
    useEffect(() => {
        // 1. جلب التوكن من المكان الذي تحفظه فيه (localStorage أو cookies أو context)
        const token = localStorage.getItem('token'); // ⚠️ عدّل هذا السطر بناءً على طريقة حفظك للتوكن

        if (!token) return;

        // 2. بناء الاتصال بناءً على تعليمات الباكند
        const connection = new HubConnectionBuilder()
            .withUrl("http://marketexpress.somee.com/chatHub", {
                accessTokenFactory: () => token, // إرسال التوكن
                transport: HttpTransportType.WebSockets // إجبار الاتصال عبر WebSocket
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect() // إعادة الاتصال تلقائياً لو انقطع
            .build();

        // 3. بدء الاتصال
        connection.start()
            .then(() => console.log("✅ متصل بـ SignalR بنجاح"))
            .catch(err => console.error("❌ خطأ في الاتصال بـ SignalR: ", err));

        // 4. الاستماع للرسائل الجديدة (⚠️ تأكد من صديقتك من اسم الحدث الذي يرسله الباكند)
        // افترضت هنا أن اسم الحدث هو "ReceiveMessage"
        connection.on("ReceiveMessage", (newMessage) => {
            console.log("رسالة جديدة:", newMessage);

            // تحديث رسائل الشكوى في React Query مباشرة بدون إعادة تحميل
            queryClient.setQueryData(['messages', newMessage.complaintId], (oldData: any) => {
                if (!oldData) return oldData;
                
                // إضافة الرسالة الجديدة للمصفوفة الحالية
                return {
                    ...oldData,
                    data: [...oldData.data, newMessage]
                };
            });
        });

        // 5. إغلاق الاتصال عند مغادرة الصفحة
        return () => {
            connection.stop();
        };
    }, [queryClient]); // سيعمل مرة واحدة عند تحميل المكون

    const handleSelectComplaint = (id: any) => {
        setSelectedComplaintId(id);
        markAsRead(id);
    };

    // ... (باقي كود الـ return الخاص بالواجهة كما هو بدون تغيير) ...

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-black text-gray-800">إدارة شكاوى الزبائن</h1>
                <p className="text-xs text-gray-500 mt-1">متابعة الشكاوى الواردة من الزبائن والتفاعل معها.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1️⃣ قائمة الشكاوى (الجانبية) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700">
                        الشكاوى الواردة ({complaintsList.length})
                    </div>
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                        {complaintsList.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">لا توجد شكاوى مسجلة حتى الآن.</div>
                        ) : (
                            complaintsList.map((complaint: any) => (
                                <div
                                    key={complaint.id}
                                    onClick={() => handleSelectComplaint(complaint.id)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedComplaintId === complaint.id ? 'bg-blue-50/70 border-r-4 border-blue-600' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-gray-900 truncate">{complaint.title}</h4>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(complaint.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">{complaint.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2️⃣ تفاصيل ومحادثة الشكوى المحددة */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    {selectedComplaintId ? (
                        <>
                            {/* رأس المحادثة */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-sm text-gray-800">سجل الرسائل والمراسلات</span>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                    شكوى رقم #{selectedComplaintId}
                                </span>
                            </div>

                            {/* صندوق عرض الرسائل */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                {isLoadingMessages ? (
                                    <div className="flex justify-center items-center h-full text-gray-400 text-xs">جاري تحميل الرسائل...</div>
                                ) : messagesList.length === 0 ? (
                                    <div className="flex justify-center items-center h-full text-gray-400 text-xs">لا توجد رسائل مرسلة ضمن هذه الشكوى بعد.</div>
                                ) : (
                                    messagesList.map((msg: any, index: any) => (
                                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-1">
                                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                                                <span className="font-bold text-gray-700">مرسل من الزبون</span>
                                                <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                           <p>{msg.message || msg.content || msg.description || msg.text || msg.body}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <span className="text-3xl">💬</span>
                            <span className="text-sm font-medium">الرجاء اختيار شكوى من القائمة الجانبية لعرض التفاصيل والمتابعة.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}