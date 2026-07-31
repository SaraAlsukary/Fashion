import { useState, useEffect, useContext } from 'react';
import { useComplaints } from '../../hooks/useComlaints';
import { useQueryClient } from '@tanstack/react-query';
import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnection } from '@microsoft/signalr';
import { AuthContext } from '../../contexts/AuthContext';

export default function StoreComplaintsPage() {
    const { useGetAllComplaints, useGetMessagesByComplaintId } = useComplaints();
    const queryClient = useQueryClient();

    const { data: complaintsResponse, isLoading: isLoadingComplaints } = useGetAllComplaints();
    const complaintsList = complaintsResponse?.data || (Array.isArray(complaintsResponse) ? complaintsResponse : []);

    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
    const [newMessageText, setNewMessageText] = useState(""); // 👈 حالة لحفظ النص المكتوب

    const { data: messagesResponse, isLoading: isLoadingMessages } = useGetMessagesByComplaintId(selectedComplaintId);
    const messagesList = messagesResponse?.data || (Array.isArray(messagesResponse) ? messagesResponse : []);
    const { user } = useContext(AuthContext);
    // 👈 حالة لحفظ كائن الاتصال بـ SignalR لاستخدامه في الإرسال
    const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) return;

        const connection = new HubConnectionBuilder()
            .withUrl("http://marketexpress.somee.com/chatHub", {
                accessTokenFactory: () => token,
                transport: HttpTransportType.WebSockets
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => {
                console.log("✅ متصل بـ SignalR بنجاح");
                setHubConnection(connection); // 👈 حفظ الاتصال بعد نجاحه
            })
            .catch(err => console.error("❌ خطأ في الاتصال بـ SignalR: ", err));

        // استقبال الرسائل
        connection.on("ReceiveMessage", (newMessage) => {
            console.log("رسالة جديدة:", newMessage);
            queryClient.setQueryData(['messages', newMessage.complaintId], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: [...oldData.data, newMessage]
                };
            });
        });

        return () => {
            connection.stop();
        };
    }, [queryClient]);

    // 👈 الدالة التي تنفذ عند اختيار شكوى
    const handleSelectComplaint = async (id: any) => {
        setSelectedComplaintId(id);

        // 👈 إخبار الباكند أن المستخدم فتح المحادثة والرسائل قُرئت (كما طلبت صديقتك)
        if (hubConnection && hubConnection.state === "Connected") {
            try {
                await hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: id });
            } catch (err) {
                console.error("خطأ في تحديث حالة القراءة:", err);
            }
        }
    };

    // 👈 دالة إرسال الرسالة إلى الباكند
    const handleSendMessage = async () => {
        if (!newMessageText.trim() || !selectedComplaintId || !hubConnection) return;

        try {
            // استدعاء الدالة SendMessageAsync التي برمجتها صديقتك
            await hubConnection.invoke("SendMessageAsync", {
                ComplaintId: selectedComplaintId,
                MessageText: newMessageText
            });

            // تفريغ حقل النص بعد الإرسال بنجاح
            setNewMessageText("");
        } catch (error) {
            console.error("❌ خطأ أثناء إرسال الرسالة:", error);
        }
    };

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
                                    onClick={() => handleSelectComplaint(complaint.id || complaint.complaintId || complaint.Id)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedComplaintId === complaint.id ? 'bg-blue-50/70 border-r-4 border-blue-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-gray-900 truncate">{complaint.title}</h4>
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
                                    messagesList.map((msg: any, index: any) => {
                                        // 👈 2. تحديد هوية المستخدم (هل أنا من أرسل هذه الرسالة؟)
                                        const currentUserId = user?.id || user?.uid || user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                                        // تأكدي من اسم الخاصية القادمة من الباك إند (هل هي senderId أم userId أم شيء آخر)
                                        const isMe = msg.senderId === currentUserId;

                                        return (
                                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm space-y-1 ${isMe
                                                        ? 'bg-blue-600 text-white rounded-tl-none' // رسائل التاجر (أزرق)
                                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none' // رسائل الزبون (أبيض)
                                                    }`}>
                                                    <div className={`flex justify-between items-center text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'} gap-4`}>
                                                        <span className="font-bold">{isMe ? 'أنت' : 'الزبون'}</span>
                                                        <span dir="ltr">{new Date(msg.createdAt || msg.sendAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="whitespace-pre-wrap">{msg.messageText || msg.message || msg.content || msg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* 3️⃣ 👈 حقل الإدخال وزر الإرسال الجديد */}
                            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessageText}
                                    onChange={(e) => setNewMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessageText.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    إرسال
                                </button>
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