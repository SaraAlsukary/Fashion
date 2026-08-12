import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { useComplaints } from '../../hooks/useComlaints'; // تأكد من تصحيح الإملاء إذا كان useComplaints
import { useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import { AuthContext } from '../../contexts/AuthContext';
import { SignalRContext } from '../../contexts/SignalRContext';

// --- واجهات البيانات (Interfaces) ---
interface Complaint {
    id?: number | string;
    complaintId?: number | string;
    Id?: number | string;
    title: string;
    description: string;
}

interface Message {
    id?: string | number;
    Id?: string | number;
    messageText?: string;
    MessageText?: string;
    message?: string;
    text?: string;
    content?: string;
    senderId?: string;
    SenderId?: string;
    userId?: string;
    sentAt?: string;
    SentAt?: string;
    createdAt?: string;
    isRead?: boolean;
    IsRead?: boolean;
    isEdited?: boolean;
    isTemp?: boolean;
}

export default function StoreComplaintsPage() {
    const { useGetAllComplaints, useGetMessagesByComplaintId } = useComplaints();
    const queryClient = useQueryClient();

    // جلب قائمة الشكاوى
    const { data: complaintsResponse } = useGetAllComplaints();
    const complaintsList: Complaint[] = complaintsResponse?.data || (Array.isArray(complaintsResponse) ? complaintsResponse : []);

    const [selectedComplaintId, setSelectedComplaintId] = useState<number | string | null>(null);
    const selectedComplaintIdRef = useRef(selectedComplaintId);

    useEffect(() => {
        selectedComplaintIdRef.current = selectedComplaintId;
    }, [selectedComplaintId]);

    const [newMessageText, setNewMessageText] = useState("");

    // حالات التعديل
    const [editingMsgId, setEditingMsgId] = useState<string | number | null>(null);
    const [editMsgText, setEditMsgText] = useState("");

    // جلب الرسائل للشكوى المحددة
    const { data: messagesResponse, isLoading: isLoadingMessages } = useGetMessagesByComplaintId(selectedComplaintId as any);
    const messagesList: Message[] = messagesResponse?.data || (Array.isArray(messagesResponse) ? messagesResponse : []);

    // سياق المستخدم والاتصال
    const { user } = useContext(AuthContext);
    const hubConnection = useContext(SignalRContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // استخراج معرف المستخدم الحالي
    const currentUserId = useMemo(() => {
        if (!user) return '';
        const rawId = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            user?.nameidentifier || user?.id || user?.uid || user?.userId || user?.sub || user?.Id || '';
        return String(rawId).toLowerCase().trim();
    }, [user]);

    const currentUserIdRef = useRef(currentUserId);
    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    }, [currentUserId]);

    const [isConnected, setIsConnected] = useState<boolean>(
        hubConnection?.state === signalR.HubConnectionState.Connected
    );

    // متابعة حالة اتصال SignalR
    useEffect(() => {
        if (!hubConnection) return;
        const checkState = () => setIsConnected(hubConnection.state === signalR.HubConnectionState.Connected);
        checkState();

        // يمكن الاعتماد على أحداث SignalR بدلاً من setInterval لتقليل استهلاك الموارد
        hubConnection.onclose(() => setIsConnected(false));
        hubConnection.onreconnecting(() => setIsConnected(false));
        hubConnection.onreconnected(() => setIsConnected(true));
    }, [hubConnection]);

    // دالة تحديث الكاش
    // دالة تحديث الكاش الآمنة
    const updateMessagesCache = useCallback((targetComplaintId: any, updater: (list: any[]) => any[]) => {
        if (!targetComplaintId) return;

        const updateFn = (oldData: any) => {
            if (!oldData) return oldData;
            const currentList = oldData?.data || (Array.isArray(oldData) ? oldData : []);
            const updatedList = updater(currentList);
            return oldData?.data ? { ...oldData, data: updatedList } : updatedList;
        };

        queryClient.setQueryData(['messages', String(targetComplaintId)], updateFn);
        queryClient.setQueryData(['messages', Number(targetComplaintId)], updateFn);
    }, [queryClient]);

    const formatMessageDate = (dateString?: string) => {
        if (!dateString) return '';
        let safeDateString = dateString;
        if (!safeDateString.endsWith('Z') && !safeDateString.includes('+')) {
            safeDateString += 'Z';
        }

        const date = new Date(safeDateString);
        if (isNaN(date.getTime())) return '';

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();
        const time = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `اليوم، ${time}`;
        if (isYesterday) return `الأمس، ${time}`;
        return `${date.toLocaleDateString('ar-EG')}، ${time}`;
    };

    const scrollToBottom = useCallback((smooth = true) => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        });
    }, []);

    useEffect(() => {
        if (selectedComplaintId && !isLoadingMessages) {
            scrollToBottom(true);
        }
    }, [messagesList?.length, selectedComplaintId, isLoadingMessages, scrollToBottom]);

    // إدارة غرف SignalR (Join / Leave)
    // إدارة أحداث SignalR الاستقبال اللحظي
    useEffect(() => {
        if (!hubConnection) return;

        // 💡 تم إزالة دالة handleReconnected وكود الانضمام من هنا بالكامل
        // لأن الانضمام سيتم تلقائياً عبر الـ useEffect الخاص بالغرف بمجرد تغير isConnected إلى true

        // 1. استلام رسالة جديدة من السيرفر
        const handleReceiveMessage = (messageDto: any) => {
            const incomingCompId = messageDto?.complaintId || messageDto?.ComplaintId || selectedComplaintIdRef.current;
            const activeCompId = selectedComplaintIdRef.current;

            const msgSenderId = String(messageDto?.senderId || messageDto?.SenderId || messageDto?.userId || '').toLowerCase().trim();
            const msgText = messageDto?.messageText || messageDto?.MessageText || messageDto?.message || messageDto?.text || '';

            updateMessagesCache(incomingCompId, (currentList) => {
                const incomingId = messageDto?.id || messageDto?.Id;
                const exists = currentList.some((m: any) => String(m.id || m.Id) === String(incomingId));
                if (exists) return currentList;

                // استبدال الرسالة المؤقتة (Optimistic Update)
                const tempIndex = currentList.findIndex((m: any) =>
                    m.isTemp &&
                    String(m.senderId || m.SenderId).toLowerCase().trim() === msgSenderId &&
                    (m.messageText === msgText || m.message === msgText)
                );

                if (tempIndex !== -1) {
                    const updated = [...currentList];
                    updated[tempIndex] = { ...messageDto, isTemp: false };
                    return updated;
                }

                return [...currentList, messageDto];
            });

            if (String(incomingCompId) === String(activeCompId)) {
                scrollToBottom(true);
                if (msgSenderId && msgSenderId !== currentUserIdRef.current) {
                    hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: Number(activeCompId) }).catch(() => { });
                }
            }
        };

        // 2. استلام تعديل على رسالة
        const handleMessageEdited = (payload: any, newTextArg?: string) => {
            let messageId = payload?.messageId || payload?.MessageId || payload?.id || payload?.Id || payload;
            let newText = payload?.messageText || payload?.MessageText || payload?.text || payload?.newText || newTextArg;
            let compId = payload?.complaintId || payload?.ComplaintId || selectedComplaintIdRef.current;

            updateMessagesCache(compId, (currentList) =>
                currentList.map((msg: any) =>
                    (String(msg.id || msg.Id) === String(messageId))
                        ? { ...msg, messageText: newText, message: newText, text: newText, isEdited: true }
                        : msg
                )
            );
        };

        // 3. استلام حذف رسالة
        const handleMessageDeleted = (payload: any) => {
            let messageId = payload?.messageId || payload?.MessageId || payload?.id || payload?.Id || payload;
            let compId = payload?.complaintId || payload?.ComplaintId || selectedComplaintIdRef.current;

            updateMessagesCache(compId, (currentList) =>
                currentList.filter((msg: any) => String(msg.id || msg.Id) !== String(messageId))
            );
        };

        // 4. استلام حالة القراءة
        const handleMessagesRead = (payload: any) => {
            let compId = payload?.complaintId || payload?.ComplaintId || payload;
            const targetId = compId || selectedComplaintIdRef.current;

            updateMessagesCache(targetId, (currentList) =>
                currentList.map((msg: any) => ({ ...msg, isRead: true, IsRead: true }))
            );
        };

        hubConnection.on("ReceiveMessage", handleReceiveMessage);
        hubConnection.on("MessageEdited", handleMessageEdited);
        hubConnection.on("MessageDeleted", handleMessageDeleted);
        hubConnection.on("MessagesMarkedAsRead", handleMessagesRead);

        return () => {
            hubConnection.off("ReceiveMessage", handleReceiveMessage);
            hubConnection.off("MessageEdited", handleMessageEdited);
            hubConnection.off("MessageDeleted", handleMessageDeleted);
            hubConnection.off("MessagesMarkedAsRead", handleMessagesRead);
        };
    }, [hubConnection, updateMessagesCache, scrollToBottom]);

    // إدارة أحداث SignalR الاستقبال اللحظي
    useEffect(() => {
        if (!hubConnection) return;

        const handleReconnected = async () => {
            const activeCompId = selectedComplaintIdRef.current;
            if (activeCompId) {
                try {
                    await hubConnection.invoke("JoinComplaintGroup", Number(activeCompId));
                    await hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: Number(activeCompId) });
                } catch (err) {
                    console.error("خطأ إعادة الانضمام:", err);
                }
            }
        };

        hubConnection.onreconnected(handleReconnected);

        const handleReceiveMessage = (messageDto: any) => {
            const incomingCompId = messageDto?.complaintId || messageDto?.ComplaintId || selectedComplaintIdRef.current;
            const activeCompId = selectedComplaintIdRef.current;
            const msgSenderId = String(messageDto?.senderId || messageDto?.SenderId || messageDto?.userId || '').toLowerCase().trim();
            const msgText = messageDto?.messageText || messageDto?.MessageText || messageDto?.message || messageDto?.text || '';

            updateMessagesCache(incomingCompId, (currentList) => {
                const incomingId = messageDto?.id || messageDto?.Id;
                if (currentList.some(m => String(m.id || m.Id) === String(incomingId))) return currentList;

                const tempIndex = currentList.findIndex(m =>
                    m.isTemp &&
                    String(m.senderId || m.SenderId).toLowerCase().trim() === msgSenderId &&
                    (m.messageText === msgText || m.message === msgText)
                );

                if (tempIndex !== -1) {
                    const updated = [...currentList];
                    updated[tempIndex] = { ...messageDto, isTemp: false };
                    return updated;
                }

                return [...currentList, messageDto];
            });

            if (String(incomingCompId) === String(activeCompId)) {
                scrollToBottom(true);
                if (msgSenderId && msgSenderId !== currentUserIdRef.current) {
                    hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: Number(activeCompId) }).catch(() => { });
                }
            }
        };

        const handleMessageEdited = (payload: any, newTextArg?: string) => {
            let messageId = payload?.messageId || payload?.MessageId || payload?.id || payload?.Id || payload;
            let newText = payload?.messageText || payload?.MessageText || payload?.text || payload?.newText || newTextArg;
            let compId = payload?.complaintId || payload?.ComplaintId || selectedComplaintIdRef.current;

            updateMessagesCache(compId, (currentList) =>
                currentList.map(msg => (String(msg.id || msg.Id) === String(messageId))
                    ? { ...msg, messageText: newText, message: newText, text: newText, isEdited: true }
                    : msg
                )
            );
        };

        const handleMessageDeleted = (payload: any) => {
            let messageId = payload?.messageId || payload?.MessageId || payload?.id || payload?.Id || payload;
            let compId = payload?.complaintId || payload?.ComplaintId || selectedComplaintIdRef.current;

            updateMessagesCache(compId, (currentList) =>
                currentList.filter(msg => String(msg.id || msg.Id) !== String(messageId))
            );
        };

        const handleMessagesRead = (payload: any) => {
            let compId = payload?.complaintId || payload?.ComplaintId || payload;
            const targetId = compId || selectedComplaintIdRef.current;

            updateMessagesCache(targetId, (currentList) =>
                currentList.map(msg => ({ ...msg, isRead: true, IsRead: true }))
            );
        };

        hubConnection.on("ReceiveMessage", handleReceiveMessage);
        hubConnection.on("MessageEdited", handleMessageEdited);
        hubConnection.on("MessageDeleted", handleMessageDeleted);
        hubConnection.on("MessagesMarkedAsRead", handleMessagesRead);

        return () => {
            hubConnection.off("ReceiveMessage", handleReceiveMessage);
            hubConnection.off("MessageEdited", handleMessageEdited);
            hubConnection.off("MessageDeleted", handleMessageDeleted);
            hubConnection.off("MessagesMarkedAsRead", handleMessagesRead);
            // إزالة onreconnected المخصصة لعدم تكرار التخزين في الذاكرة
            hubConnection.off("reconnected", handleReconnected);
        };
    }, [hubConnection, updateMessagesCache, scrollToBottom]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessageText.trim() || !hubConnection || !isConnected || !selectedComplaintId) return;

        const textToSend = newMessageText.trim();
        setNewMessageText('');

        const tempId = `temp-${Date.now()}`;
        const tempMessage: Message = {
            id: tempId,
            Id: tempId,
            messageText: textToSend,
            sentAt: new Date().toISOString(),
            senderId: currentUserId,
            isRead: false,
            isEdited: false,
            isTemp: true
        };

        updateMessagesCache(selectedComplaintId, (list) => [...list, tempMessage]);
        scrollToBottom(true);

        try {
            const response = await hubConnection.invoke("SendMessageAsync", {
                ComplaintId: Number(selectedComplaintId),
                MessageText: textToSend
            });

            if (response) {
                const realId = response.id || response.Id || response;
                updateMessagesCache(selectedComplaintId, (list) =>
                    list.map(m => (m.id === tempId || m.Id === tempId) ? { ...m, ...response, id: realId, Id: realId, isTemp: false } : m)
                );
            } else {
                updateMessagesCache(selectedComplaintId, (list) =>
                    list.map(m => (m.id === tempId || m.Id === tempId) ? { ...m, isTemp: false } : m)
                );
            }
        } catch (error) {
            console.error("خطأ أثناء إرسال الرسالة:", error);
            updateMessagesCache(selectedComplaintId, (list) => list.filter(m => m.id !== tempId && m.Id !== tempId));
            setNewMessageText(textToSend); // إعادة النص في حال الفشل
        }
    };

    const submitEditMessage = async (messageId: string | number) => {
        if (!editMsgText.trim() || !hubConnection) return;
        const textToSend = editMsgText.trim();

        updateMessagesCache(selectedComplaintId!, (currentList) =>
            currentList.map(msg => (String(msg.id || msg.Id) === String(messageId))
                ? { ...msg, messageText: textToSend, isEdited: true }
                : msg
            )
        );

        setEditingMsgId(null);
        setEditMsgText("");

        try {
            await hubConnection.invoke("EditMessageAsync", {
                ComplaintId: Number(selectedComplaintId),
                MessageId: Number(messageId),
                MessageText: textToSend
            });
        } catch (error) {
            console.error("خطأ التعديل:", error);
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    };

    const handleDeleteMessage = async (messageId: string | number) => {
        if (!window.confirm("هل أنت متأكد من حذف هذه الرسالة؟") || !hubConnection) return;

        updateMessagesCache(selectedComplaintId!, (currentList) =>
            currentList.filter(msg => String(msg.id || msg.Id) !== String(messageId))
        );

        try {
            await hubConnection.invoke("DeleteMessageAsync", {
                ComplaintId: Number(selectedComplaintId),
                MessageId: Number(messageId)
            });
        } catch (error) {
            console.error("خطأ الحذف:", error);
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">إدارة شكاوى الزبائن</h1>
                    <p className="text-xs text-gray-500 mt-1">متابعة الشكاوى الواردة من الزبائن والتفاعل معها.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* قائمة الشكاوى */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700">
                        الشكاوى الواردة ({complaintsList.length})
                    </div>
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                        {complaintsList.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">لا توجد شكاوى.</div>
                        ) : (
                            complaintsList.map((complaint) => {
                                const complaintId = complaint.id || complaint.complaintId || complaint.Id;
                                const isSelected = String(selectedComplaintId) === String(complaintId);

                                return (
                                    <div
                                        key={complaintId}
                                        onClick={() => setSelectedComplaintId(complaintId as string | number)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${isSelected ? 'bg-blue-50/70 border-r-4 border-blue-600' : ''}`}
                                    >
                                        <h4 className="font-bold text-sm text-gray-900 truncate">{complaint.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{complaint.description}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* صندوق المحادثة */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    {selectedComplaintId ? (
                        <>
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-sm text-gray-800">سجل الرسائل والمراسلات</span>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                                    شكوى رقم #{selectedComplaintId}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                {(!currentUserId) ? (
                                    <div className="flex justify-center items-center h-full text-blue-500 text-xs font-bold">جاري إعداد هوية المحادثة...</div>
                                ) : isLoadingMessages ? (
                                    <div className="flex justify-center items-center h-full text-gray-400 text-xs">جاري تحميل الرسائل...</div>
                                ) : messagesList.length === 0 ? (
                                    <div className="flex justify-center items-center h-full text-gray-400 text-xs">لا توجد رسائل بعد.</div>
                                ) : (
                                    messagesList.map((msg, index) => {
                                        const msgSenderId = String(msg.senderId || msg.SenderId || msg.userId || '').toLowerCase().trim();
                                        const isMe = Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId);
                                        const messageId = msg.id || msg.Id;
                                        const isRead = Boolean(msg.isRead ?? msg.IsRead);

                                        return (
                                            <div key={messageId || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                                <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm space-y-1 relative ${isMe ? 'bg-blue-600 text-white rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'}`}>

                                                    <div className={`flex justify-between items-center text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'} gap-4 mb-1`}>
                                                        <span className="font-bold">{isMe ? 'أنت (التاجر)' : 'الزبون'}</span>
                                                        <span dir="rtl">{formatMessageDate(msg.sentAt || msg.SentAt || msg.createdAt)}</span>
                                                    </div>

                                                    {editingMsgId === messageId ? (
                                                        <div className="flex flex-col gap-2 mt-2">
                                                            <textarea
                                                                value={editMsgText}
                                                                onChange={(e) => setEditMsgText(e.target.value)}
                                                                className="text-gray-900 text-xs p-2 rounded border focus:outline-none"
                                                                rows={2}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setEditingMsgId(null)} className="text-[10px] px-2 py-1 bg-gray-300 text-gray-800 rounded">إلغاء</button>
                                                                <button onClick={() => submitEditMessage(messageId!)} className="text-[10px] px-2 py-1 bg-green-500 text-white rounded">حفظ</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap leading-relaxed">
                                                            {msg.messageText || msg.MessageText || msg.message || msg.content || msg.text}
                                                            {msg.isEdited && <span className="text-[9px] opacity-70 ms-2">(مُعدلة)</span>}
                                                        </p>
                                                    )}

                                                    {isMe && !editingMsgId && (
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-[10px] opacity-80">
                                                                {msg.isTemp ? '⏳ جاري الإرسال...' : isRead ? '✅ مقروءة' : '✓ تم الإرسال'}
                                                            </span>
                                                            {!msg.isTemp && (
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                    <button onClick={() => { setEditingMsgId(messageId!); setEditMsgText((msg.messageText || msg.MessageText || msg.message) as string); }} title="تعديل" className="text-[10px] hover:text-green-300">✏️</button>
                                                                    <button onClick={() => handleDeleteMessage(messageId!)} title="حذف" className="text-[10px] hover:text-red-300">🗑️</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessageText}
                                    onChange={(e) => setNewMessageText(e.target.value)}
                                    placeholder={isConnected ? "اكتب رسالتك هنا..." : "جاري الاتصال بالخادم..."}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={!isConnected}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessageText.trim() || !isConnected}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    إرسال
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <span className="text-4xl">💬</span>
                            <span className="text-sm font-medium">الرجاء اختيار شكوى من القائمة الجانبية لعرض التفاصيل والمتابعة.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}