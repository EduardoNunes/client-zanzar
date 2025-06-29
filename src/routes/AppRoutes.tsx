import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import { useGlobalContext } from "../context/globalContext";
import CreatePost from "../pages/CreatePost";
import CreateStore from "../pages/CreateStore";
import Feed from "../pages/Feed";
import InvitesPage from "../pages/InvitesPage";
import Login from "../pages/Login";
import Messages from "../pages/Messages";
import MyCart from "../pages/MyCart";
import NotificationsPage from "../pages/Notifications";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import AdminRoutes from "./AdminRoutes";
import StoreRoutes from "./StoreRoutes";
import MyPurchases from "../pages/MyPurchases";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoadingToken } = useGlobalContext();

  if (!token && !isLoadingToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/:token" element={<Register />} />

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
              <NotificationsPage />
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
      <Route
        path="/my-purchases"
        element={
          <ProtectedRoute>
            <Layout>
              <MyPurchases />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rotas da loja separadas */}
      <Route
        path="/user-store/*"
        element={
          <ProtectedRoute>
            <Layout>
              <StoreRoutes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
