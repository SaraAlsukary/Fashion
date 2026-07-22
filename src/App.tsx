import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';
import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from './components/layouts/AuthLayout';
import Loading from './components/templates/Loading';
import StoreOwnerLayout from './components/layouts/StoreOwnerLayout';


// 1. استدعاء الصفحات والمخططات بنظام التحميل الكسول (Lazy Loading)
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
const UserProfileDashboard = lazy(() => import("./views/user/UserProfileDashboard"));
const Cart = lazy(() => import("./views/store/Cart"));
const NotFound = lazy(() => import('./views/NotFound'));
const SearchPage = lazy(() => import('./views/store/SearchPage'));
const Join = lazy(() => import('./views/auth/Join'));
const StoreRegister = lazy(() => import('./views/auth/StoreRegister'));

// استدعاء ملفات Super Admin بنظام Lazy Loading
const SuperAdminLayout = lazy(() => import('./components/layouts/SuperAdminLayout'));
const DashboardPage = lazy(() => import('./views/superAdmin/Dashboard'));
const StoreRequestsPage = lazy(() => import('./views/superAdmin/StoreRequestsPage'));
const RolesPage = lazy(() => import('./views/superAdmin/RolesPage'));
const TransactionsPage = lazy(() => import('./views/superAdmin/TransactionsPage'));
const UsersManagePage = lazy(() => import('./views/superAdmin/UsersManagePage'));
const CategoryPage = lazy(() => import('./views/superAdmin/Category'));







// Store Owner
const Dashboard = lazy(() => import('./views/admin/Dashboard'));
const StoreSettingsPage = lazy(() => import('./views/admin/StoreSettingsPage'));
const AttributesPage = lazy(() => import('./views/admin/AttributesPage'));
const CategoriesPage = lazy(() => import('./views/admin/CategoriesPage'));
const ProductFormPage = lazy(() => import('./views/admin/ProductFormPage'));
const ProductsPage = lazy(() => import('./views/admin/ProductsPage'));





// 2. إعداد الراوتر الرئيسي للموقع
const router = createBrowserRouter([
  // =====================================
  // مسارات التطبيق الرئيسية (Main Layout)
  // =====================================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "stores",
        element: <Suspense fallback={<Loading />}><AllStores /></Suspense>
      },
      {
        path: "stores/:storeId",
        element: <Suspense fallback={<Loading />}><StoreDetails /></Suspense>
      },
      {
        path: "stores/:storeId/products/:productId",
        element: <Suspense fallback={<Loading />}><ProductDetails /></Suspense>
      },
      {
        path: "cart",
        element: <Suspense fallback={<Loading />}><Cart /></Suspense>
      },
      {
        path: "my-profile",
        element: <Suspense fallback={<Loading />}><UserProfileDashboard /></Suspense>
      },
      {
        path: "search",
        element: <Suspense fallback={<Loading />}><SearchPage /></Suspense>
      },
      {
        path: "*",
        element: <Suspense fallback={<Loading />}><NotFound /></Suspense>,
      }
    ]
  },

  // =====================================
  // مسارات المصادقة (Auth Layout)
  // =====================================
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Suspense fallback={<Loading />}><Login /></Suspense>
      },
      {
        path: "register",
        element: <Suspense fallback={<Loading />}><Register /></Suspense>
      },
      {
        path: "confirm-email",
        element: <Suspense fallback={<Loading />}><ConfirmEmail /></Suspense>
      },
      {
        path: "confirm-email-password",
        element: <Suspense fallback={<Loading />}><ConfirmEmailPassword /></Suspense>
      },
      {
        path: "forgot-password",
        element: <Suspense fallback={<Loading />}><ForgotPassword /></Suspense>
      },
      {
        path: "reset-password",
        element: <Suspense fallback={<Loading />}><ResetPassword /></Suspense>
      },
      {
        path: "store",
        element: <Suspense fallback={<Loading />}><StoreRegister /></Suspense>
      },
      {
        path: "join",
        element: <Suspense fallback={<Loading />}><Join /></Suspense>
      }
    ]
  },

  // =====================================
  // مسارات لوحة التحكم (Super Admin Layout)
  // =====================================
  {
    path: "/super-admin",
    element: <Suspense fallback={<Loading />}><SuperAdminLayout /></Suspense>, // استخدمنا Suspense هنا لـ Layout
    children: [
      {
        index: true,
        element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense>
      },
      {
        path: "requests",
        element: <Suspense fallback={<Loading />}><StoreRequestsPage /></Suspense>
      },
      {
        path: "roles",
        element: <Suspense fallback={<Loading />}><RolesPage /></Suspense>
      },
      {
        path: "transactions",
        element: <Suspense fallback={<Loading />}><TransactionsPage /></Suspense>
      },
      {
        path: "users",
        element: <Suspense fallback={<Loading />}><UsersManagePage /></Suspense>
      },
      {
        path: "categories",
        element: <Suspense fallback={<Loading />}><CategoryPage /></Suspense>
      }
    ]
  },
  {
  path: "/admin",
  element: <Suspense fallback={<Loading />}><StoreOwnerLayout /></Suspense>,
  children: [
    {
      index: true,
      element: <Suspense fallback={<Loading />}><Dashboard /></Suspense>
    },
    {
      path: "settings",
      element: <Suspense fallback={<Loading />}><StoreSettingsPage /></Suspense>
    },
    {
      path: "attributes",
      element: <Suspense fallback={<Loading />}><AttributesPage /></Suspense>
    },
    {
      path: "categories",
      element: <Suspense fallback={<Loading />}><CategoriesPage /></Suspense>
    },
    {
      path: "products",
      children: [
        {
          index: true,
          element: <Suspense fallback={<Loading />}><ProductsPage /></Suspense>
        },
        {
          path: "add",
          element: <Suspense fallback={<Loading />}><ProductFormPage /></Suspense>
        },
        {
          path: "edit/:id",
          element: <Suspense fallback={<Loading />}><ProductFormPage /></Suspense>
        }
      ]
    }
  ]
}
]);

// 3. المكون الأساسي للتطبيق
function App() {
  return <RouterProvider router={router} />;
}

export default App;