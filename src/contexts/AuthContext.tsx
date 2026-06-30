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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ name: "User Name" }); // جلب بيانات المستخدم أو فك التوكن هنا
        }
        setLoading(false);
    }, []);

    const logout = async () => {
        try {
            await api.post('/Auth/logout');
        } catch (err) {
            toast.error("خطأ أثناء تسجيل الخروج", err);
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