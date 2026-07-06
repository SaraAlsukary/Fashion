import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';
import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from './components/layouts/AuthLayout';
import Loading from './components/templates/Loading';

// 1. استدعاء الصفحات بنظام التحميل الكسول (Lazy Loading)
// بدلاً من الاستدعاء العادي، نستخدم lazy لتقسيم الكود (Code Splitting)
const Home = lazy(() => import("./views/Home"));
const Login = lazy(() => import("./views/auth/Login"));
const Register = lazy(() => import("./views/auth/Register"));
const ConfirmEmail = lazy(() => import("./views/auth/ConfirmEmail"));
const ConfirmEmailPassword = lazy(() => import("./views/auth/ConfirmEmailPassword"));
const ForgotPassword = lazy(() => import("./views/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./views/auth/ResetPassword"));
const AllStores = lazy(() => import("./views/store/AllStores"));
const StoreDetails = lazy(() => import("./views/store/StoreDetails"));
const ProductDetails = lazy(() => import("./views/store/ProductDetails"));
const Profile = lazy(() => import("./views/user/Profile"));
const Cart = lazy(() => import("./views/store/Cart"));
const NotFound = lazy(() => import('./views/NotFound'));
const SearchPage = lazy(() => import('./views/store/SearchPage'));
const Join = lazy(() => import('./views/auth/Join'));
const StoreRegister = lazy(() => import('./views/auth/StoreRegister'));
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
        element: <Suspense fallback={<Loading />}>
          <NotFound />
        </Suspense>,
      }, {
        path: "stores",
        element: <Suspense fallback={<Loading />}>
          <AllStores />
        </Suspense>
      }, {
        path: "stores/:storeId",
        element: <Suspense fallback={<Loading />}>
          <StoreDetails />
        </Suspense>
      }, {
        path: "stores/:storeId/products/:productId",
        element: <Suspense fallback={<Loading />}>
          <ProductDetails />
        </Suspense>
      }, {
        path: "cart",
        element: <Suspense fallback={<Loading />}>
          <Cart />
        </Suspense>
      }
      , {
        path: "my-profile",
        element: <Suspense fallback={<Loading />}>
          <Profile />
        </Suspense>
      },
      {
        path: "/search",
        element: <Suspense fallback={<Loading />}>
          <SearchPage />
        </Suspense>
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
        path: "confirm-email-password", element: <Suspense fallback={<Loading />}>
          <ConfirmEmailPassword />
        </Suspense>
      },
      {
        path: "forgot-password", element: <Suspense fallback={<Loading />}>
          <ForgotPassword />
        </Suspense>
      },
      {
        path: "reset-password", element: <Suspense fallback={<Loading />}>
          <ResetPassword />
        </Suspense>
      }
      , {
        path: "store",
        element: <Suspense fallback={<Loading />}>
          <StoreRegister />
        </Suspense>
      }, {
        path: "join",
        element: <Suspense fallback={<Loading />}>
          <Join />
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