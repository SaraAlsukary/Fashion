import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// 1. استيراد المكونات المطلوبة من React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.tsx';

// 2. إنشاء نسخة (Instance) جديدة من الـ QueryClient خارج المكون
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // إعدادات اختيارية لتجنب إعادة طلب البيانات عند التركيز على النافذة
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
