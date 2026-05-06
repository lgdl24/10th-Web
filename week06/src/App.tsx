import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import HomeLayout from "./layouts/HomeLayout";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLayout from "./layouts/ProtectedLayout";
import GoogleLoginRedirectPage from "./pages/GoogleLoginRedirectPage";
import SignupCompletePage from "./pages/SignupCompletePage";
import LpDetailPage from "./pages/LpDetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "signup/complete", element: <SignupCompletePage /> },
      { path: "v1/auth/google/callback", element: <GoogleLoginRedirectPage /> },

      // LP 상세 + /my 모두 인증 필요 → ProtectedLayout 하위로 통합
      {
        element: <ProtectedLayout />,
        children: [
          { path: "lp/:lpId", element: <LpDetailPage /> },
          { path: "my", element: <MyPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
