import { jwtDecode } from "jwt-decode";
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: any;
    setUser: (user: any) => void;
    loading: boolean; 
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    // داخل AuthProvider
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // فك التوكن لاستخراج بيانات المستخدم (مثل الاسم، الصلاحيات، الخ)
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token'); // تنظيف التوكن إذا كان تالفاً
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const logout = async () => {
        try {
            await api.post('/Auth/logout');
        } catch (err:any) {
            console.log(err)
            toast.error("خطأ أثناء تسجيل الخروج");
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            // نقوم بإعادة التوجيه يدوياً هنا لتجنب الحاجة لـ useNavigate الخارجي
            window.location.href = '/auth/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};