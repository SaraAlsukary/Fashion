import { useState, useEffect, useContext } from 'react';
import { useComplaints } from '../../hooks/useComlaints'; // مسار الـ hook الخاص بك
import * as signalR from '@microsoft/signalr';
import { AuthContext } from '../../contexts/AuthContext';
export default function UserComplaintsTab() {
    // استخدمنا الـ hook الجديد الذي يجلب شكاوى اليوزر فقط
    const { data: complaints, isLoading, isError } = useComplaints().useGetAllComplaintsByUser();
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const { data: messages, isLoading: loadingMessages } = useComplaints().useGetMessagesByComplaintId(selectedComplaint?.id);

    // إدارة حالة SignalR
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [liveMessages, setLiveMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
    const { user } = useContext(AuthContext);
    // إعداد SignalR عند اختيار شكوى
    useEffect(() => {
        if (!selectedComplaint) return;

        // تهيئة الاتصال
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://marketexpress.somee.com/chatHub", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
        setLiveMessages(messages || []); // تحميل الرسائل السابقة

    }, [selectedComplaint, messages]);

    useEffect(() => {
        if (!connection || !selectedComplaint) return;

        const startConnection = async () => {
            try {
                setConnectionStatus('connecting');
                await connection.start();
                setConnectionStatus('connected');

                // الانضمام لغرفة الشكوى المحددة
                await connection.invoke("JoinComplaintGroup", selectedComplaint.id);

                // استقبال الرسائل الجديدة
                connection.on("ReceiveMessage", (senderId, messageText) => {
                    const newMsg = {
                        senderId,
                        message: messageText,
                        sendAt: new Date().toISOString()
                    };
                    setLiveMessages(prev => [...prev, newMsg]);
                });

            } catch (error) {
                console.error("SignalR Connection Error:", error);
                setConnectionStatus('failed');
            }
        };

        startConnection();

        return () => {
            if (connection) {
                connection.off("ReceiveMessage");
                connection.stop();
            }
        };
    }, [connection]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connection || connectionStatus !== 'connected') return;

        try {
            // استدعاء دالة الإرسال في الباك إند
            await connection.invoke("SendMessage", selectedComplaint.id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error("Send Message Error:", error);
            alert("فشل إرسال الرسالة. يرجى التأكد من الاتصال.");
        }
    };

    if (isLoading) return <div className="text-center p-4">جاري تحميل الشكاوى...</div>;
    if (isError) return <div className="text-center text-red-500 p-4">حدث خطأ أثناء جلب الشكاوى</div>;

    return (
        <div className="space-y-6">
            {!selectedComplaint ? (
                // --- قائمة الشكاوى ---
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">شكاوي واستفسارات</h2>
                    {complaints?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">لا توجد شكاوى حالية.</p>
                    ) : (
                        <div className="space-y-3">
                            {complaints?.map((comp: any) => (
                                <div
                                    key={comp.id}
                                    onClick={() => setSelectedComplaint(comp)}
                                    className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-800">{comp.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{comp.description}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${comp.isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {comp.isResolved ? 'مغلقة' : 'مفتوحة'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // --- واجهة المحادثة ---
                <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{selectedComplaint.title}</h3>
                            <span className="text-xs text-gray-500">
                                الحالة: {connectionStatus === 'connected' ? 'متصل 🟢' : connectionStatus === 'connecting' ? 'جاري الاتصال 🟡' : 'غير متصل 🔴'}
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedComplaint(null)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            العودة للقائمة ↩
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
                        {loadingMessages ? (
                            <div className="text-center text-gray-500 text-sm">جاري تحميل الرسائل السابقة...</div>
                        ) : (
                            liveMessages.map((msg: any, index: number) => {

                                // 2. التعديل هنا: استخدام معرّف المستخدم من الكونتكس
                                // 💡 ملاحظة: في ASP.NET Core، عادة ما يكون الـ ID مخزناً في التوكن تحت اسم معقد مثل nameidentifier
                                // لذلك نضع احتمالات لاسم الخاصية حسب ما يرسله الباك إند
                                const currentUserId = user?.id || user?.uid || user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                                const isMe = msg.senderId === currentUserId;

                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-xl text-sm ${isMe ? 'bg-amber-500 text-white rounded-tl-none' : 'bg-white text-gray-800 rounded-tr-none shadow-sm'}`}>
                                            <p>{msg.message}</p>
                                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                                                {new Date(msg.sendAt).toLocaleTimeString('ar-SA')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="اكتب رسالتك هنا..."
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                            disabled={connectionStatus !== 'connected'}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
                        >
                            إرسال
                        </button>
                    </form>
                </div>
            )
            }
        </div >
    );
}