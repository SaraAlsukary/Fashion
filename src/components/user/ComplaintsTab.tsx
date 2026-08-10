// components/user/ComplaintsTab.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HubConnectionBuilder, LogLevel, HubConnection, HttpTransportType } from '@microsoft/signalr';
import { AuthContext } from '../../contexts/AuthContext'; // تأكد من المسار الصحيح
import { useComplaints } from '../../hooks/useComlaints';

export default function ComplaintsTab() {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const {
        useGetAllComplaintsByUser,
        useAddComplaint,
        useGetMessagesByComplaintId
    } = useComplaints();

    // 1. جلب الشكاوى الخاصة بالمستخدم
    const { data: complaintsResponse, isLoading, isError } = useGetAllComplaintsByUser();
    const complaintsList = complaintsResponse?.data || (Array.isArray(complaintsResponse) ? complaintsResponse : []);

    // 2. حالة إضافة شكوى جديدة
    const addComplaintMutation = useAddComplaint();
    const [storeId, setStoreId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showAddForm, setShowAddForm] = useState(false); // لإظهار/إخفاء فورم الإضافة

    // 3. حالة الدردشة (SignalR)
    const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
    const [newMessageText, setNewMessageText] = useState("");
    const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);

    // جلب رسائل الشكوى المحددة
    const { data: messagesResponse, isLoading: isLoadingMessages } = useGetMessagesByComplaintId(selectedComplaintId);
    const messagesList = messagesResponse?.data || (Array.isArray(messagesResponse) ? messagesResponse : []);



    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;


        const connection = new HubConnectionBuilder()
            .withUrl("http://marketexpress.somee.com/chatHub", {
                accessTokenFactory: () => localStorage.getItem('token') || "",
                transport: HttpTransportType.LongPolling // إجبار الاتصال على LongPolling حصرياً
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        connection.start()
            .then(() => {
                console.log("✅ متصل بـ SignalR بنجاح (المستخدم)");
                setHubConnection(connection);
            })
            .catch(err => console.error("❌ خطأ في الاتصال بـ SignalR: ", err));

        // استقبال الرسائل المباشرة
        connection.on("receiveprivatemessage", (newMessage) => {
            queryClient.setQueryData(['messages', newMessage.complaintId], (oldData: any) => {
                if (!oldData) return oldData;
                const messagesArray = oldData?.data || (Array.isArray(oldData) ? oldData : []);
                return {
                    ...oldData,
                    data: [...messagesArray, newMessage]
                };
            });
        });

        return () => {
            connection.stop();
        };
    }, [queryClient]);

    // 5. دوال التعامل مع الشكاوى والمراسلة
    const handleSubmitNewComplaint = (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId || !title || !description) return;

        addComplaintMutation.mutate(
            { storeId: Number(storeId), title, description },
            {
                onSuccess: () => {
                    setStoreId(''); setTitle(''); setDescription('');
                    setShowAddForm(false); // إخفاء الفورم بعد الإرسال
                },
                onError: () => alert('حدث خطأ أثناء إرسال الشكوى')
            }
        );
    };

    const handleSelectComplaint = async (id: number) => {
        setSelectedComplaintId(id);
        // إخبار الباكند أن المستخدم فتح المحادثة
        if (hubConnection && hubConnection.state === "Connected") {
            try {
                await hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: id });
            } catch (err) {
                console.error("خطأ في تحديث حالة القراءة:", err);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!newMessageText.trim() || !selectedComplaintId || !hubConnection) return;
        try {
            await hubConnection.invoke("SendMessageAsync", {
                ComplaintId: selectedComplaintId,
                MessageText: newMessageText
            });
            setNewMessageText(""); // تفريغ الحقل
        } catch (error) {
            console.error("❌ خطأ أثناء إرسال الرسالة:", error);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">الشكاوى والدعم</h2>
                    <p className="text-xs text-gray-500 mt-1">تتبع شكاويك وتواصل مع الدعم الفني أو المتاجر.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                    {showAddForm ? 'إلغاء' : '+ شكوى جديدة'}
                </button>
            </div>

            {/* نموذج إضافة شكوى (يظهر عند الضغط على الزر) */}
            {showAddForm && (
                <form onSubmit={handleSubmitNewComplaint} className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="number" placeholder="رقم المتجر (Store ID)" value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none text-sm" required />
                        <input type="text" placeholder="عنوان الشكوى" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none text-sm" required />
                    </div>
                    <textarea placeholder="تفاصيل الشكوى..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none resize-none text-sm" rows={3} required />
                    <button type="submit" disabled={addComplaintMutation.isPending} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 text-sm">
                        {addComplaintMutation.isPending ? 'جاري الإرسال...' : 'إرسال الشكوى'}
                    </button>
                </form>
            )}

            {/* تقسيم الشاشة: القائمة + المحادثة */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">

                {/* 1️⃣ قائمة الشكاوى */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700">
                        شكاوي السابقة ({complaintsList.length})
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                        {isLoading && <div className="text-center py-8 text-gray-400 text-xs">جاري التحميل...</div>}
                        {isError && <div className="text-center py-8 text-red-500 text-xs">حدث خطأ في التحميل.</div>}
                        {!isLoading && !isError && complaintsList.length === 0 && (
                            <div className="text-center py-12 text-gray-400 text-xs">لا توجد شكاوى سابقة.</div>
                        )}

                        {complaintsList.map((complaint: any, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => handleSelectComplaint(complaint.id || complaint.complaintId)}
                                className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedComplaintId === (complaint.id || complaint.complaintId) ? 'bg-amber-50/70 border-r-4 border-amber-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-gray-900 truncate">{complaint.title}</h4>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">متجر: {complaint.storeId}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1">{complaint.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2️⃣ تفاصيل ومحادثة الشكوى */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
                    {selectedComplaintId ? (
                        <>
                            {/* رأس المحادثة */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-sm text-gray-800">المحادثة مع الدعم/المتجر</span>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
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
                                        // تحديد هوية المستخدم (لمعرفة شكل الرسالة)
                                        const currentUserId = user?.id || user?.uid || user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                                        const isMe = msg.senderId === currentUserId;

                                        return (
                                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm space-y-1 ${isMe
                                                    ? 'bg-amber-500 text-white rounded-tl-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'
                                                    }`}>
                                                    <div className={`flex justify-between items-center text-[10px] ${isMe ? 'text-amber-100' : 'text-gray-400'} gap-4`}>
                                                        <span className="font-bold">{isMe ? 'أنت' : 'الدعم'}</span>
                                                        <span dir="ltr">{new Date(msg.createdAt || msg.sendAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.messageText || msg.message || msg.content || msg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* حقل الإدخال وزر الإرسال */}
                            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessageText}
                                    onChange={(e) => setNewMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="اكتب رسالتك هنا للتواصل..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessageText.trim()}
                                    className="cursor-pointer bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    إرسال
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <span className="text-4xl">💬</span>
                            <span className="text-sm font-medium">الرجاء اختيار شكوى من القائمة الجانبية لعرض المحادثة.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}