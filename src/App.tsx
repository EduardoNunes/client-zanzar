import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
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
  const { autentication, setSocketConnect, token } = useGlobalContext();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(Capacitor.getPlatform() !== "web");
  }, []);

  useEffect(() => {
    if (socket && token) {
      setSocketConnect(socket);
    }
  }, [socket, setSocketConnect]);

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

  if (!isTokenLoaded || isMobile === null) return null;

  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acesso não permitido
        </h1>
        <p className="text-gray-600">
          Este aplicativo foi projetado para ser usado apenas em dispositivos
          móveis.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-white">
      <div className="bg-gray-100 h-screen">
        <div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="colored"
          />
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

export default AppWrapper;
