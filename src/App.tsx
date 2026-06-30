import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';
import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from './components/layouts/AuthLayout';
import Loading from './components/templates/Loading';
import NotFound from './views/NotFound';

// 1. استدعاء الصفحات بنظام التحميل الكسول (Lazy Loading)
// بدلاً من الاستدعاء العادي، نستخدم lazy لتقسيم الكود (Code Splitting)
const Home = lazy(() => import("./views/Home"));
const Login = lazy(() => import("./views/auth/Login"));
const Register = lazy(() => import("./views/auth/Register"));
const ConfirmEmail = lazy(() => import("./views/auth/ConfirmEmail"));
const ForgotPassword = lazy(() => import("./views/auth/ForgotPassword"));
// 2. تصميم شاشة التحميل الاحترافية (Professional Loader)
// يمكنك فصل هذا المكون في ملف مستقل لاحقاً (مثلاً: src/components/ui/Loader.jsx)


// 3. إعداد الراوتر الرئيسي للموقع
const router = createBrowserRouter([
  // مسارات التطبيق الرئيسية
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "*",
        element: <NotFound />,
      },
    ]
  },
  // مسارات المصادقة
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login", element:
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
      },
      {
        path: "register", element: <Suspense fallback={<Loading />}>
          <Register />
        </Suspense>
      },
      {
        path: "confirm-email", element: <Suspense fallback={<Loading />}>
          <ConfirmEmail />
        </Suspense>
      },
      {
        path: "forgot-password", element: <Suspense fallback={<Loading />}>
          <ForgotPassword />
        </Suspense>
      }
    ]
  }
]);

// 4. المكون الأساسي للتطبيق
function App() {
  return <RouterProvider router={router} />;
}

export default App;