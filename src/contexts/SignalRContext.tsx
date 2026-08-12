import { createContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export const SignalRContext = createContext<signalR.HubConnection | null>(null);

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        let isMounted = true; // 👈 1. إضافة متغير لتتبع حالة المكون

        const token = localStorage.getItem('token');
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://marketexpress.somee.com/chatHub", {
                accessTokenFactory: () => token || ""
            })
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => {
                // 👈 2. تعيين الاتصال في الـ Context فقط إذا كان المكون لم يتم تدميره
                if (isMounted) { 
                    setConnection(newConnection);
                    console.log('نجح الاتصال بالخادم');
                }
            })
            .catch((error) => {
                console.error('فشل الاتصال:', error);
            });

        return () => { 
            // 👈 3. إبطال التحديثات وإغلاق الاتصال عند إزالة المكون (أو أثناء Strict Mode)
            isMounted = false; 
            newConnection.stop(); 
        };
    }, []);

    return (
        <SignalRContext.Provider value={connection}>
            {children}
        </SignalRContext.Provider>
    );
};