import Login from "./auth/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import VerifyEmail from "./auth/VerifyEmail";
import HereSection from "./components/HereSection";
import MainLayout from "./layout/MainLayout";
import Profile from "./components/Profile";
import SearchPage from "./components/SearchPage";
import RestaurantDetail from "./components/RestaurantDetail";
import Cart from "./components/Cart";
import Restaurant from "./admin/Restaurant";
import AddMenu from "./admin/AddMenu";
import Orders from "./admin/Orders";
import Success from "./components/Success";
import { useUserStore } from "./store/useUserStore";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import Loading from "./components/Loading";
import { useThemeStore } from "./store/useThemeStore";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/" replace />
  }
  return children;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// A new component to handle the demo login process
const DemoLoginHandler = () => {
  const { demoLogin, isCheckingAuth } = useUserStore();
  
  // Use useEffect to trigger the demo login as soon as the component mounts
  useEffect(() => {
    // Only attempt to log in if we're not already in the middle of a check
    if (!isCheckingAuth) {
      demoLogin();
    }
  }, [demoLogin, isCheckingAuth]);

  // We can show a loading state while the demo user is being authenticated
  if (isCheckingAuth) {
    return <Loading />;
  }

  // The ProtectedRoutes component will take care of redirecting to the main page
  // once the demo user is authenticated.
  return (
    <ProtectedRoutes>
      <MainLayout />
    </ProtectedRoutes>
  );
};


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: <HereSection />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/search/:text",
        element: <SearchPage />,
      },
      {
        path: "/restaurant/:id",
        element: <RestaurantDetail />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order/status",
        element: <Success />,
      },
      // admin services start from here
      {
        path: "/admin/restaurant",
        element: <AdminRoute><Restaurant /></AdminRoute>,
      },
      {
        path: "/admin/menu",
        element: <AdminRoute><AddMenu /></AdminRoute>,
      },
      {
        path: "/admin/orders",
        element: <AdminRoute><Orders /></AdminRoute>,
      },
    ],
  },
  {
    path: "/demo",
    element: <DemoLoginHandler />, // New route for the demo login
  },
  {
    path: "/login",
    element: <AuthenticatedUser><Login /></AuthenticatedUser>,
  },
  {
    path: "/signup",
    element: <AuthenticatedUser><Signup /></AuthenticatedUser>,
  },
  {
    path: "/forgot-password",
    element: <AuthenticatedUser><ForgotPassword /></AuthenticatedUser>,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
]);

function App() {
  const initializeTheme = useThemeStore((state: any) => state.initializeTheme);
  const { checkAuthentication, isCheckingAuth } = useUserStore();
  // checking auth every time when page is loaded
  useEffect(() => {
    checkAuthentication();
    initializeTheme();
  }, [checkAuthentication])

  if (isCheckingAuth) return <Loading />
  return (
    <main>
      <RouterProvider router={appRouter}></RouterProvider>
    </main>
  );
}

export default App;
