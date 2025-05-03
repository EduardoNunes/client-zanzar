import React from "react";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Layout from "./components/Layout";
import { GlobalProvider, useGlobalContext } from "./context/globalContext";
import CreatePost from "./pages/CreatePost";
import Feed from "./pages/Feed";
import InvitesPage from "./pages/InvitesPage";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import AdminRoutes from "./routes/AdminRoutes";
import UserStorePage from "./pages/UserStore";
import CreateStore from "./pages/CreateStore";
import MyCart from "./pages/MyCart";
import { App as CapacitorApp } from "@capacitor/app";

export default function App() {
  const { token, autentication, isLoadingToken } = useGlobalContext();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadToken = async () => {
      await autentication();
      setIsTokenLoaded(true);
    };

    loadToken();
  }, []);

  useEffect(() => {
    let backButtonListener: any;

    const setupBackButtonListener = async () => {
      if (CapacitorApp) {
        backButtonListener = await CapacitorApp.addListener(
          "backButton",
          () => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              console.log("No more history to go back to.");
              return;
            }
          }
        );
      }
    };

    setupBackButtonListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [navigate]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isTokenLoaded || isLoadingToken) {
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
      <GlobalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
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
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invites"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InvitesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-store/:slug"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserStorePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-store"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateStore />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-cart"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyCart />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </>
  );
}
