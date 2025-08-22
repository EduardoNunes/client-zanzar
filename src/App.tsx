import { App as CapacitorApp } from "@capacitor/app";
import { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GlobalProvider, useGlobalContext } from "./context/globalContext";
import AppRoutes from "./routes/AppRoutes";
import { useSocket } from "./hooks/useSocket";

function AppWrapper() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalProvider>
  );
}

function App() {
  const { autentication, setSocketConnect, profileId, token } =
    useGlobalContext();
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  // Carrega token e profileId antes de renderizar
  useEffect(() => {
    const loadAuth = async () => {
      await autentication();
      setIsReady(true);
    };
    loadAuth();
  }, [autentication]);

  // Quando o socket estiver pronto, guarda no contexto
  useEffect(() => {
    if (socket && profileId && token) {
      console.log("Socket pronto e conectado para profileId:", profileId);
      setSocketConnect(socket);
    }
  }, [socket, profileId, token, setSocketConnect]);

  // Botão de voltar no Capacitor
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
            }
          }
        );
      }
    };
    setupBackButtonListener();
    return () => {
      if (backButtonListener) backButtonListener.remove();
    };
  }, [navigate]);

  if (!isReady) return null;

  return (
    <div className="relative h-screen bg-white">
      <div className="bg-gray-100 h-screen">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <AppRoutes />
      </div>
    </div>
  );
}

export default AppWrapper;
