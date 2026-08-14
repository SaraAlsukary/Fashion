import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
// 1. التعديل الأول: استيراد الـ Hooks مباشرة بدلاً من استخراجها من Hook آخر
import {  useComplaints } from '../../hooks/useComlaints';
import { useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import { AuthContext } from '../../contexts/AuthContext';
import { SignalRContext } from '../../contexts/SignalRContext';

export default function UserComplaintsTab() {
    const queryClient = useQueryClient();
    const { useGetAllComplaintsByUser, useGetMessagesByComplaintId} = useComplaints()
    // جلب الشكاوى الخاصة بالزبون
    const { data: complaintsResponse, isLoading, isError } = useGetAllComplaintsByUser();
    const complaints = complaintsResponse?.data || (Array.isArray(complaintsResponse) ? complaintsResponse : []);

    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const selectedComplaintId = selectedComplaint?.id || selectedComplaint?.complaintId || selectedComplaint?.Id;

    const selectedComplaintIdRef = useRef(selectedComplaintId);
    useEffect(() => {
        selectedComplaintIdRef.current = selectedComplaintId;
    }, [selectedComplaintId]);

    const [newMessageText, setNewMessageText] = useState('');
    const [editingMsgId, setEditingMsgId] = useState<any>(null);
    const [editMsgText, setEditMsgText] = useState("");

    // جلب الرسائل للشكوى المحددة
    const { data: messagesResponse, isLoading: loadingMessages } = useGetMessagesByComplaintId(selectedComplaintId);
    const messagesList: any[] = messagesResponse?.data || (Array.isArray(messagesResponse) ? messagesResponse : []);

    const { user } = useContext(AuthContext);
    const hubConnection = useContext(SignalRContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // استخراج معرف المستخدم الحالي
    const currentUserId = useMemo(() => {
        if (!user) return '';
        const rawId = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            user?.nameidentifier ||
            user?.id ||
            user?.uid ||
            user?.userId ||
            user?.sub ||
            user?.Id ||
            '';
        return String(rawId).toLowerCase().trim();
    }, [user]);

    const currentUserIdRef = useRef(currentUserId);
    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    }, [currentUserId]);

    const [isConnected, setIsConnected] = useState<boolean>(
        hubConnection?.state === signalR.HubConnectionState.Connected
    );

    useEffect(() => {
        if (!hubConnection) return;
        const checkState = () => setIsConnected(hubConnection.state === signalR.HubConnectionState.Connected);
        checkState();
        const interval = setInterval(checkState, 2000);
        return () => clearInterval(interval);
    }, [hubConnection]);

    // فحص هل الرسالة للمستخدم الحالي
    const isMyMessage = useCallback((msg: any) => {
        if (!currentUserId) return false;
        const msgSenderId = String(
            msg?.senderId || msg?.SenderId || msg?.userId || msg?.UserId || msg?.SenderID || ''
        ).toLowerCase().trim();
        return msgSenderId === currentUserId;
    }, [currentUserId]);

    // تحديث كاش React Query الآمن
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

    // دالة تعليم الرسائل كمقروءة بالخادم والكاش المحلي
    const markAsRead = useCallback(async (compId: any) => {
        if (!hubConnection || !isConnected || !compId) return;
        try {
            await hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: Number(compId) });
            updateMessagesCache(compId, (currentList) =>
                currentList.map((msg: any) => ({ ...msg, isRead: true, IsRead: true }))
            );
        } catch (err) {
            console.error("خطأ أثناء تحديد الرسائل كمقروءة:", err);
        }
    }, [hubConnection, isConnected, updateMessagesCache]);

    // تنسيق التاريخ
    const formatMessageDate = (dateString: string) => {
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

    const scrollToBottom = (smooth = true) => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        });
    };

    useEffect(() => {
        if (selectedComplaintId && !loadingMessages) {
            scrollToBottom(true);
        }
    }, [messagesList?.length, selectedComplaintId, loadingMessages]);

    // 2. التعديل الثاني: الانضمام والخروج من غرفة الشكوى (Join / Leave)
    useEffect(() => {
        if (isConnected && selectedComplaintId && hubConnection) {
            const joinComplaintRoom = async () => {
                try {
                    await hubConnection.invoke("JoinComplaintGroup", Number(selectedComplaintId));
                    await hubConnection.invoke("MarkMessagesAsRead", { ComplaintId: Number(selectedComplaintId) });
                } catch (err) {
                    console.error("خطأ أثناء الانضمام للغرفة:", err);
                }
            };

            joinComplaintRoom();

            // Cleanup: الخروج من الغرفة عند تغيير الشكوى أو تدمير المكون لمنع تداخل الرسائل
            return () => {
                hubConnection.invoke("LeaveComplaintGroup", Number(selectedComplaintId)).catch(err => {
                    console.error("خطأ أثناء الخروج من الغرفة:", err);
                });
            };
        }
    }, [isConnected, selectedComplaintId, hubConnection]);

    // تعليم الرسائل كمقروءة تلقائياً عند الاتصال
    useEffect(() => {
        if (selectedComplaintId && isConnected) {
            markAsRead(selectedComplaintId);
        }
    }, [selectedComplaintId, isConnected, markAsRead]);

    // إدارة أحداث SignalR
    useEffect(() => {
        if (!hubConnection) return;

        const handleConnectState = () => {
            setIsConnected(hubConnection.state === signalR.HubConnectionState.Connected);
        };

        handleConnectState();

        const handleReconnected = () => {
            setIsConnected(true);
            const activeCompId = selectedComplaintIdRef.current;
            if (activeCompId) {
                markAsRead(activeCompId);
            }
        };

        hubConnection.onreconnected(handleReconnected);
        hubConnection.onreconnecting(() => setIsConnected(false));
        hubConnection.onclose(() => setIsConnected(false));

        // 1. استقبال رسالة جديدة
        const handleReceiveMessage = (messageDto: any) => {
            const incomingCompId = messageDto?.complaintId || messageDto?.ComplaintId || selectedComplaintIdRef.current;
            const activeCompId = selectedComplaintIdRef.current;

            const msgSenderId = String(messageDto?.senderId || messageDto?.SenderId || messageDto?.userId || '').toLowerCase().trim();
            const msgText = messageDto?.messageText || messageDto?.MessageText || messageDto?.message || messageDto?.text || '';

            updateMessagesCache(incomingCompId, (currentList) => {
                const incomingId = messageDto?.id || messageDto?.Id;

                const exists = currentList.some((m: any) => String(m.id || m.Id) === String(incomingId));
                if (exists) return currentList;

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
                    markAsRead(activeCompId);
                }
            }
        };

        // 2. تعديل رسالة
        const handleMessageEdited = (payload: any, newTextArg?: string) => {
            let messageId = payload;
            let newText = newTextArg;
            let compId = selectedComplaintIdRef.current;

            if (typeof payload === 'object' && payload !== null) {
                messageId = payload.messageId || payload.MessageId || payload.id || payload.Id;
                newText = payload.messageText || payload.MessageText || payload.text || payload.newText;
                compId = payload.complaintId || payload.ComplaintId || compId;
            }

            updateMessagesCache(compId, (currentList) =>
                currentList.map((msg: any) =>
                    String(msg.id || msg.Id) === String(messageId)
                        ? { ...msg, messageText: newText, message: newText, text: newText, isEdited: true }
                        : msg
                )
            );
        };

        // 3. حذف رسالة
        const handleMessageDeleted = (payload: any) => {
            let messageId = payload;
            let compId = selectedComplaintIdRef.current;
            if (typeof payload === 'object' && payload !== null) {
                messageId = payload.messageId || payload.MessageId || payload.id || payload.Id;
                compId = payload.complaintId || payload.ComplaintId || compId;
            }

            updateMessagesCache(compId, (currentList) =>
                currentList.filter((msg: any) => String(msg.id || msg.Id) !== String(messageId))
            );
        };

        // 4. تحديث حالة القراءة عند وصول الحدث من السيرفر
        const handleMessagesRead = (payload: any) => {
            let compId = payload;
            if (typeof payload === 'object' && payload !== null) {
                compId = payload.complaintId || payload.ComplaintId;
            }

            const activeCompId = selectedComplaintIdRef.current;
            const targetId = compId || activeCompId;

            updateMessagesCache(targetId, (currentList) =>
                currentList.map((msg: any) => ({
                    ...msg,
                    isRead: true,
                    IsRead: true
                }))
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
    }, [hubConnection, updateMessagesCache, markAsRead]);

    // اختيار الشكوى
    const handleSelectComplaint = (comp: any) => {
        setSelectedComplaint(comp);
    };

    // إرسال رسالة
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!newMessageText.trim() || !hubConnection || !isConnected || !selectedComplaintId) return;

        const textToSend = newMessageText.trim();
        setNewMessageText('');

        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            Id: tempId,
            messageText: textToSend,
            message: textToSend,
            sentAt: new Date().toISOString(),
            senderId: currentUserId,
            SenderId: currentUserId,
            isRead: false,
            IsRead: false,
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
                    list.map((m) =>
                        m.id === tempId || m.Id === tempId
                            ? { ...m, ...response, id: realId, Id: realId, isTemp: false }
                            : m
                    )
                );
            } else {
                updateMessagesCache(selectedComplaintId, (list) =>
                    list.map((m) => (m.id === tempId || m.Id === tempId ? { ...m, isTemp: false } : m))
                );
            }
        } catch (error) {
            console.error("❌ خطأ إرسال الرسالة:", error);
            updateMessagesCache(selectedComplaintId, (list) => list.filter((m) => m.id !== tempId && m.Id !== tempId));
            setNewMessageText(textToSend);
        }
    };

    // تعديل رسالة
    const submitEditMessage = async (messageId: any) => {
        if (!editMsgText.trim() || !hubConnection) return;
        const textToSend = editMsgText.trim();

        updateMessagesCache(selectedComplaintId, (currentList) =>
            currentList.map((msg: any) =>
                (String(msg.id || msg.Id) === String(messageId))
                    ? { ...msg, messageText: textToSend, message: textToSend, text: textToSend, isEdited: true }
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
            console.error("❌ خطأ التعديل:", error);
            // 3. التعديل الثالث: تحديد الشكوى فقط عند إعادة التحميل
            queryClient.invalidateQueries({ queryKey: ['messages', String(selectedComplaintId)] });
        }
    };

    // حذف رسالة
    const handleDeleteMessage = async (messageId: any) => {
        if (!window.confirm("هل أنت متأكد من حذف هذه الرسالة؟") || !hubConnection) return;

        updateMessagesCache(selectedComplaintId, (currentList) =>
            currentList.filter((msg: any) => String(msg.id || msg.Id) !== String(messageId))
        );

        try {
            await hubConnection.invoke("DeleteMessageAsync", {
                ComplaintId: Number(selectedComplaintId),
                MessageId: Number(messageId)
            });
        } catch (error) {
            console.error("❌ خطأ الحذف:", error);
            // تحديد الشكوى فقط عند إعادة التحميل
            queryClient.invalidateQueries({ queryKey: ['messages', String(selectedComplaintId)] });
        }
    };

    if (isLoading) return <div className="text-center p-8 text-gray-500 text-sm">جاري تحميل الشكاوى...</div>;
    if (isError) return <div className="text-center text-red-500 p-8 text-sm">حدث خطأ أثناء جلب الشكاوى</div>;

    return (
        <div className="space-y-6">
            {!selectedComplaint ? (
                /* --- قائمة الشكاوى --- */
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">شكاوي واستفساراتي</h2>
                    {complaints?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm">لا توجد شكاوى حالية.</p>
                    ) : (
                        <div className="space-y-3">
                            {complaints?.map((comp: any) => {
                                const compId = comp.id || comp.complaintId || comp.Id;
                                return (
                                    <div
                                        key={compId}
                                        onClick={() => handleSelectComplaint(comp)}
                                        className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm flex justify-between items-center bg-white"
                                    >
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{comp.title}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{comp.description}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${comp.isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {comp.isResolved ? 'مغلقة' : 'مفتوحة'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* --- واجهة المحادثة --- */
                <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    {/* Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">{selectedComplaint.title}</h3>
                        </div>
                        <button
                            onClick={() => setSelectedComplaint(null)}
                            className="text-gray-600 hover:text-gray-900 text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"
                        >
                            العودة للقائمة ↩
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {loadingMessages ? (
                            <div className="flex justify-center items-center h-full text-gray-400 text-xs">جاري تحميل الرسائل...</div>
                        ) : messagesList?.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-400 text-xs">لا توجد رسائل سابقة. ابدأ المحادثة الآن.</div>
                        ) : (
                            messagesList?.map((msg: any, index: number) => {
                                const isMe = isMyMessage(msg);
                                const messageId = msg.id || msg.Id;
                                const isRead = Boolean(msg.isRead ?? msg.IsRead);

                                return (
                                    <div key={messageId || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm space-y-1 relative ${isMe ? 'bg-amber-500 text-white rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'}`}>

                                            {/* Header */}
                                            <div className={`flex justify-between items-center text-[10px] ${isMe ? 'text-amber-100' : 'text-gray-400'} gap-4 mb-1`}>
                                                <span className="font-bold">{isMe ? 'أنت' : 'الدعم / المتجر'}</span>
                                                <span dir="rtl">{formatMessageDate(msg.sentAt || msg.SentAt || msg.createdAt || msg.sendAt || msg.SendAt)}</span>
                                            </div>

                                            {/* نص الرسالة أو التعديل */}
                                            {editingMsgId === messageId ? (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <textarea
                                                        value={editMsgText}
                                                        onChange={(e) => setEditMsgText(e.target.value)}
                                                        className="text-gray-900 text-xs p-2 rounded border focus:outline-none bg-white"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingMsgId(null)} className="text-[10px] px-2 py-1 bg-gray-300 text-gray-800 rounded">إلغاء</button>
                                                        <button onClick={() => submitEditMessage(messageId)} className="text-[10px] px-2 py-1 bg-green-500 text-white rounded">حفظ</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap leading-relaxed">
                                                    {msg.messageText || msg.MessageText || msg.message || msg.content || msg.text}
                                                    {msg.isEdited && <span className="text-[9px] opacity-70 ms-2">(مُعدلة)</span>}
                                                </p>
                                            )}

                                            {/* الإجراءات وحالة الرسالة */}
                                            {isMe && !editingMsgId && (
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-amber-400/30">
                                                    <span className="text-[10px] opacity-90 font-medium">
                                                        {msg.isTemp ? (
                                                            <span className="animate-pulse">⏳ جاري الإرسال...</span>
                                                        ) : isRead ? (
                                                            <span className="text-emerald-200 font-bold">✅ مقروءة</span>
                                                        ) : (
                                                            <span>✓ تم الإرسال</span>
                                                        )}
                                                    </span>

                                                    {!msg.isTemp && (
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => { setEditingMsgId(messageId); setEditMsgText(msg.messageText || msg.MessageText || msg.message || ''); }}
                                                                className="text-[11px] font-bold hover:text-amber-200 flex items-center gap-1 transition-colors"
                                                            >
                                                                ✏️ تعديل
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMessage(messageId)}
                                                                className="text-[11px] font-bold hover:text-red-200 flex items-center gap-1 transition-colors"
                                                            >
                                                                🗑️ حذف
                                                            </button>
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

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            placeholder={isConnected ? "اكتب رسالتك هنا..." : "جاري الاتصال..."}
                            className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm transition-all disabled:opacity-50"
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            disabled={!newMessageText.trim() || !isConnected}
                            className="bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
                        >
                            إرسال
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}