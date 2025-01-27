import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import Feed from "./pages/Feed";
import Layout from "./components/Layout";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import CreatePost from "./pages/CreatePost";

export default function App() {
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadedToken = Cookies.get("access_token");
    setToken(loadedToken);
    setIsTokenLoaded(true);
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isTokenLoaded) {
      return null;
    }

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rota protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Feed />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreatePost />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
